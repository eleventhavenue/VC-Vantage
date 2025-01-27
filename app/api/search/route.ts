// app/api/search/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import LRU from 'lru-cache';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { checkAndUpdateUsage } from '@/lib/usage-utils';

/* -------------------- 
   USAGE & CONSTANTS
-------------------- */

// Define usage limits
const TRIAL_LIMIT = 5;
const MONTHLY_LIMIT = 30;

// Function to check if the user can proceed based on their subscription and usage
function canProceedWithUsage(user: {
  isSubscribed: boolean;
  trialUsageCount: number;
  monthlyUsageCount: number;
}): boolean {
  return user.isSubscribed
    ? user.monthlyUsageCount < MONTHLY_LIMIT
    : user.trialUsageCount < TRIAL_LIMIT;
}

/* --------------------
   OPENAI + UTILS
-------------------- */

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Utility function to remove citation brackets like [1], [2], etc.
function removeCitations(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

/* --------------------
   INTERFACES
-------------------- */

// Define the structure of the analysis results
interface AnalysisResults {
  overview: string;
  overviewConfidence: number;
  marketAnalysis: string;
  marketConfidence: number;
  financialAnalysis: string;
  financialConfidence: number;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

// Define the structure for prompt sets based on entity type
interface IPromptsSet {
  overview: string;
  market: string;
  financial: string;
}

// Define types for person or company
type PersonOrCompany = 'people' | 'company';

// Define date and profile interfaces for LinkedIn data
interface IDateObject { day?: number; month?: number; year?: number; }
interface IExperience { starts_at?: IDateObject; ends_at?: IDateObject | null; title?: string; company?: string; description?: string; location?: string; }
interface IEducation { starts_at?: IDateObject; ends_at?: IDateObject; degree_name?: string; field_of_study?: string; school?: string; description?: string; }
interface IProxycurlProfile {
  full_name?: string; summary?: string; experiences?: IExperience[]; education?: IEducation[]; occupation?: string;
  headline?: string; city?: string; state?: string; country_full_name?: string; connections?: number;
  [key: string]: unknown;
}

/* --------------------
   LRU CACHE
-------------------- */

// Initialize LRU cache with a max of 500 items and a TTL of 1 hour
const cache = new LRU<string, AnalysisResults>({ max: 500, ttl: 1000 * 60 * 60 });

/* --------------------
   DOMAIN EXTRACTION UTILITIES
-------------------- */

// Regular expression to extract URLs
const WEBSITE_REGEX = /\b((https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))/gi;

// Domains to exclude from extraction
const EXCLUDED_DOMAINS = ['linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'youtube.com', 'tiktok.com'];

// Function to clean up extracted domain URLs
function cleanupDomain(raw: string): string {
  let domain = raw.trim();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/\/+$/, '');
  domain = domain.replace(/^www\./i, '');
  return domain;
}

// Function to check if a domain is excluded
function isExcludedDomain(domain: string): boolean {
  return EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
}

// Function to extract relevant websites from LinkedIn profile data
function extractRelevantWebsitesFromProfile(profile: IProxycurlProfile): string[] {
  const foundSites = new Set<string>();
  const fields = [profile.summary, ...(profile.experiences?.map(e => e.description) || [])];

  for (const field of fields) {
    if (field) {
      const matches = field.match(WEBSITE_REGEX);
      if (matches) {
        for (const m of matches) {
          const domain = cleanupDomain(m);
          if (!isExcludedDomain(domain)) {
            foundSites.add(domain);
          }
        }
      }
    }
  }
  return Array.from(foundSites);
}

/* --------------------
   DATA FORMATTING
-------------------- */

// Function to format LinkedIn data into a readable string
function formatLinkedInData(profile: IProxycurlProfile, name: string): string {
  if (!profile || Object.keys(profile).length === 0) {
    console.log(`No LinkedIn data found for ${name}`);
    return `No official LinkedIn data found for ${name}. Proceed carefully.`;
  }

  const experiencesText = Array.isArray(profile.experiences)
    ? profile.experiences
        .map((exp) => {
          const startYear = exp.starts_at?.year ?? 'N/A';
          const endYear = exp.ends_at?.year ?? 'Present';
          const role = exp.title ?? 'Unknown Role';
          const company = exp.company ?? 'Unknown Company';
          const desc = exp.description ? `\n   ${exp.description}` : '';
          return `• ${role} at ${company} (${startYear} - ${endYear})${desc}`;
        })
        .join('\n\n')
    : 'No experiences found.';

  const educationText = Array.isArray(profile.education)
    ? profile.education
        .map((edu) => {
          const startYear = edu.starts_at?.year ?? 'N/A';
          const endYear = edu.ends_at?.year ?? 'N/A';
          const degree = edu.degree_name ?? 'N/A';
          const field = edu.field_of_study ?? 'N/A';
          const school = edu.school ?? 'Unknown School';
          return `• ${degree} in ${field} from ${school} (${startYear} - ${endYear})`;
        })
        .join('\n')
    : 'No education info.';

  const city = profile.city ?? '';
  const state = profile.state ?? '';
  const country = profile.country_full_name ?? '';
  const location = [city, state, country].filter(Boolean).join(', ');

  return `
VERIFIED LINKEDIN DATA FOR ${name}:

Name: ${profile.full_name ?? ''}
Occupation: ${profile.occupation ?? ''}
Headline: ${profile.headline ?? ''}
Summary: ${profile.summary ?? ''}

Experience:
${experiencesText}

Education:
${educationText}

Location: ${location}
Connections: ${profile.connections ?? 'N/A'}

NOTE: If conflicting data appears elsewhere, disregard it and trust this verified snippet.
  `.trim();
}

/* --------------------
   API CALLS
-------------------- */

// Base URL for internal API calls
const BASE_URL = process.env.BASE_URL || 'https://www.vc-vantage.com';

// Function to fetch LinkedIn data via Proxycurl API
async function fetchProxycurlData(linkedinUrl: string): Promise<IProxycurlProfile | null> {
  console.log(`Fetching Proxycurl data for URL: ${linkedinUrl}`);
  const absoluteUrl = `${BASE_URL}/api/fetchLinkedInProfile?linkedinProfileUrl=${encodeURIComponent(linkedinUrl)}`;
  const res = await fetch(absoluteUrl);
  if (!res.ok) {
    console.error('Proxycurl call failed:', await res.text());
    return null;
  }
  const data = await res.json();
  console.log('Fetched LinkedIn data:', data?.full_name);
  return data as IProxycurlProfile;
}

// Function to fetch data from Perplexity API
async function fetchFromPerplexity(prompt: string): Promise<string> {
  console.log('Sending prompt to Perplexity:', prompt.slice(0, 100) + '...');
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',  // Use the new sonar-pro model
      messages: [{ role: 'user', content: prompt }],
      frequency_penalty: 1,  // Optional: adjust parameters as needed
      temperature: 0.2,
      top_p: 0.9,
      top_k: 0,
      stream: false,
      presence_penalty: 0
    }),
  });
  if (!response.ok) {
    throw new Error(`Perplexity API Error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from Perplexity API.');
  }
  const content = removeCitations(data.choices[0].message.content.trim());
  console.log('Received response from Perplexity.');
  return content;
}

// Function to analyze data using OpenAI's O1 model
async function analyzeWithO1(prompt: string): Promise<string> {
  console.log('Sending prompt to OpenAI O1:', prompt.slice(0, 100) + '...');
  const response = await openai.chat.completions.create({
    model: 'o1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: 8000,
  });
  if (!response?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from OpenAI API.');
  }
  const result = response.choices[0].message.content.trim();
  console.log('Received response from OpenAI O1.');
  return result;
}

/* --------------------
   RESPONSE VALIDATION
-------------------- */

// Define the structure for search context
interface SearchContext {
  query: string;
  type: PersonOrCompany;
  company?: string;
  title?: string;
  linkedInData?: string;
}

// Function to validate the response content based on context
function validateResponse(content: string, context: SearchContext): boolean {
  console.log('Validating response for context:', context);
  const searchTerms = [context.query];
  if (context.company) searchTerms.push(context.company);
  const paragraphs = content.split('\n\n');
  const relevantParagraphs = paragraphs.filter(p =>
    searchTerms.some(term => p.toLowerCase().includes(term.toLowerCase()))
  ).length;
  const relevanceRatio = paragraphs.length ? relevantParagraphs / paragraphs.length : 1;
  if (relevanceRatio < 0.6) {
    console.warn('Response may be losing focus on the subject');
    return false;
  }
  if (context.company && !content.toLowerCase().includes(context.company.toLowerCase())) {
    console.warn('Response lost company context');
    return false;
  }
  if (context.title && !content.toLowerCase().includes(context.title.toLowerCase())) {
    console.warn('Response lost title context');
    return false;
  }
  console.log('Response validation passed.');
  return true;
}

// Function to fetch from Perplexity with validation and retry if necessary
async function fetchFromPerplexityWithValidation(prompt: string, context: SearchContext): Promise<string> {
  let response = await fetchFromPerplexity(prompt);
  if (!validateResponse(response, context)) {
    const enhancedPrompt = `
${prompt}

CRITICAL REQUIREMENTS:
1. Focus ONLY on ${context.query}
${context.company ? `2. Discuss only their work at ${context.company}` : ''}
${context.title ? `3. Focus on their role as ${context.title}` : ''}
4. Do NOT discuss or reference any other individuals or companies.
5. Use ONLY verifiable information.
If unsure, state so rather than including unverified details.
    `;
    console.log('Retrying with enhanced prompt due to validation failure.');
    response = await fetchFromPerplexity(enhancedPrompt);
  }
  return response;
}

/* --------------------
   ZOD SCHEMA & ROUTE
-------------------- */

// Define the schema for incoming requests using Zod
const requestSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['people', 'company']),
  context: z.object({
    company: z.string().optional(),
    title: z.string().optional(),
    linkedinUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
  }).optional(),
  disambiguate: z.boolean().optional(),
});

// Define the API route handler
export async function POST(req: Request) {
  try {
    // --- Authentication & Usage Checks ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!canProceedWithUsage(user)) {
      return NextResponse.json({
        error: 'Trial limit reached. Please subscribe to continue using VC Vantage.',
        trialLimitReached: true,
        usageCount: user.trialUsageCount,
      }, { status: 402 });
    }

    // --- Request Parsing ---
    const body = await req.json();
    const { query, type, context, disambiguate } = requestSchema.parse(body);
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    let refinedQuery = sanitizedQuery;
    if (context?.company) refinedQuery += ` at ${context.company}`;
    if (context?.title) refinedQuery += `, ${context.title}`;

    // --- Disambiguation if requested ---
    if (disambiguate) {
      console.log('Performing disambiguation...');
      const disambiguationPrompt = `
You are a strict and concise assistant. We have a ${type === 'people' ? 'person' : 'company'} named "${sanitizedQuery}".
We also have optional context: Company = "${context?.company || ''}", Title = "${context?.title || ''}".
Please return up to 3 distinct individuals or entities (by name or identifying info) who match or might be confused with this name/context.
Respond in a short, plain-text list format like:
1. ...
2. ...
3. ...
No disclaimers or extra text.
If no strong matches, return fewer items or an empty list.
      `;
      const rawString = await analyzeWithO1(disambiguationPrompt);
      console.log('Disambiguation raw response:', rawString);
      const lines = rawString.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      console.log('Disambiguation suggestions:', lines);
      return NextResponse.json({ suggestions: lines });
    }

    // --- Cache Check ---
    const cacheKey = `${type}:${refinedQuery}`;
    if (cache.has(cacheKey)) {
      console.log('Cache hit for key:', cacheKey);
      return NextResponse.json(cache.get(cacheKey));
    }

    // --- Data Gathering ---
    let linkedInJSON: IProxycurlProfile | null = null;
    if (type === 'people' && context?.linkedinUrl) {
      linkedInJSON = await fetchProxycurlData(context.linkedinUrl);
    }
    const officialLinkedInData = formatLinkedInData(linkedInJSON || {}, refinedQuery);

    // Extract relevant websites from LinkedIn profile
    let siteExpansionsText = '';
    if (linkedInJSON) {
      const relevantSites = extractRelevantWebsitesFromProfile(linkedInJSON);
      if (relevantSites.length > 0) {
        const expansions: string[] = [];
        for (const domain of relevantSites) {
          console.log(`Expanding domain: ${domain}`);
          const sitePrompt = `
We have discovered a domain: "${domain}"
It is associated with ${refinedQuery}'s background from LinkedIn. 
Please summarize any relevant info about this site or company, focusing on consistency with the LinkedIn snippet. 
Ignore unrelated references.
          `;
          const expansion = await fetchFromPerplexity(sitePrompt);
          expansions.push(`Domain: ${domain}\n${expansion}`);
        }
        siteExpansionsText = expansions.join('\n\n');
      }
    }

    // Handle website disambiguation if websiteUrl is provided
    let websiteDisambiguationText = '';
    if (context?.websiteUrl) {
      console.log(`Disambiguating website: ${context.websiteUrl}`);
      const websitePrompt = `
We have a website: "${context.websiteUrl}" 
associated with ${refinedQuery}. 
Please provide any relevant corporate information, controversies, or context regarding this website in relation to ${refinedQuery}.
      `;
      websiteDisambiguationText = await fetchFromPerplexity(websitePrompt);
    }

    // Retrieve any negative corporate information
    const negativeInfoPrompt = `
Is there any negative corporate information relating to ${refinedQuery} or its affiliated entities?
    `;
    const negativeInfo = await fetchFromPerplexity(negativeInfoPrompt);

    // Combine all gathered snippets
    const combinedSnippet = `
[OFFICIAL LINKEDIN SNIPPET]
${officialLinkedInData}

[ADDITIONAL DOMAIN EXPANSIONS]
${siteExpansionsText || 'No custom domains or expansions found.'}

[WEBSITE DISAMBIGUATION]
${websiteDisambiguationText || 'No additional website information found.'}

[NEGATIVE CORPORATE INFORMATION]
${negativeInfo || 'No negative information found.'}
    `.trim();

    // Define base prompts based on entity type
    const basePrompts: Record<PersonOrCompany, IPromptsSet> = {
      people: {
        overview: `Provide a comprehensive overview of ${refinedQuery}'s professional background focusing on their current role at ${context?.company || 'their company'}. Use ONLY the LinkedIn data provided.`,
        market: `Analyze the market environment for ${refinedQuery} at ${context?.company || 'the company'}, including competitors, industry trends, and growth challenges.`,
        financial: `Evaluate any available financial information related to ${refinedQuery}'s ventures, especially at ${context?.company || 'the company'}.`,
      },
      company: {
        overview: `Provide a thorough overview of the company ${refinedQuery}, including industry focus, key products/services, founding year, location, team members, and recent developments.`,
        market: `Discuss the broader market in which ${refinedQuery} competes, including main competitors, market trends, and growth opportunities or threats.`,
        financial: `Evaluate the financial posture of ${refinedQuery}, including funding history, revenue models, recent funding rounds, and key financial challenges.`,
      },
    };

    // Define enhanced prompts with instructions for handling data limitations
    const overviewPrompt = `
You are an expert analyst. Provide a comprehensive overview of ${refinedQuery}, including its industry focus, key products/services, founding year, location, team members, and recent developments. 
Use ONLY the data provided below as the primary source of truth. 
If specific information is unavailable, infer based on industry trends and similar companies, and clearly indicate any assumptions made.

[Data Snippet]
${combinedSnippet}

${basePrompts[type].overview}
    `.trim();

    const marketPrompt = `
You are an expert analyst. Analyze the market environment for ${refinedQuery} based on the available information.
Discuss potential competitors, industry trends, and growth challenges.
Where direct data is lacking, use analogous companies or industry standards to infer possible scenarios, and note any assumptions.

[Data Snippet]
${combinedSnippet}

${basePrompts[type].market}
    `.trim();

    const financialPrompt = `
You are an expert financial analyst. Evaluate the financial posture of ${refinedQuery} based on the available information.
Include funding history, revenue models, recent funding rounds, and key financial challenges.
If specific financial data is unavailable, infer based on industry standards and similar companies, clearly indicating any assumptions made.

[Data Snippet]
${combinedSnippet}

${basePrompts[type].financial}
    `.trim();

    // Define the search context for validation
    const searchContext: SearchContext = {
      query: refinedQuery,
      type,
      company: context?.company,
      title: context?.title,
      linkedInData: officialLinkedInData
    };

    /* --------------------
       FETCHING MULTIPLE ANALYSES
    -------------------- */

    // Fetch overview, market analysis, and financial analysis concurrently with validation
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexityWithValidation(overviewPrompt, searchContext),
      fetchFromPerplexityWithValidation(marketPrompt, searchContext),
      fetchFromPerplexityWithValidation(financialPrompt, searchContext)
    ]);

    /* --------------------
       STRATEGIC ANALYSIS
    -------------------- */

    // Prompt for pattern analysis
    const patternAnalysisPrompt = `
Analyze the following verified and inferred information exclusively about ${refinedQuery}:
Overview: ${overview}
Market Analysis: ${marketAnalysis}
Financial Analysis: ${financialAnalysis}

### TASK
1. Identify non-obvious patterns, hidden risks, and opportunities concerning ${refinedQuery}.
2. Assess how different aspects interrelate.
Focus on generating insights without repeating information.
    `.trim();
    console.log('Starting pattern analysis...');
    const patternAnalysis = await analyzeWithO1(patternAnalysisPrompt);
    console.log('Pattern analysis complete.');

    // Prompt for strategic analysis based on pattern analysis
    const strategicAnalysisPrompt = `
Based on the verified and inferred information and pattern analysis for ${refinedQuery}:
${patternAnalysis}

### TASK
Provide a comprehensive strategic analysis focusing on ${refinedQuery}: 
- Leadership impact 
- Growth trajectory
- Risk-opportunity matrix
Offer specific, actionable insights and clearly indicate any assumptions or inferences made due to data limitations.
    `.trim();
    console.log('Starting strategic analysis...');
    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);
    console.log('Strategic analysis complete.');

    /* --------------------
       CONFIDENCE SCORING
    -------------------- */

    // Function to calculate confidence based on key attribute mentions
    function calculateConfidence(sectionContent: string): number {
      const keyAttributes = {
        overview: ['industry', 'products', 'founded', 'location', 'team', 'development'],
        market: ['competitors', 'industry trends', 'growth challenges', 'market share'],
        financial: ['funding', 'revenue', 'financial challenges', 'investment', 'funding rounds']
      };

      let score = 0;
      //const attributes = type === 'people' ? keyAttributes.overview : keyAttributes.overview; // Adjust if necessary
      Object.values(keyAttributes).flat().forEach(attr => {
        if (sectionContent.toLowerCase().includes(attr.toLowerCase())) score += 1;
      });
      return (score / 6) * 100; // Assuming 6 key attributes for overview
    }

    // Calculate confidence scores for each section
    const overviewConfidence = calculateConfidence(overview);
    const marketConfidence = calculateConfidence(marketAnalysis);
    const financialConfidence = calculateConfidence(financialAnalysis);

    /* --------------------
       COMPOUNDING & FINAL SYNTHESIS
    -------------------- */

    // Prompt for final executive brief
    const compilationPrompt = `
We have gathered the following information about ${refinedQuery}:

**Overview:**
${overview}  
**Confidence:** ${overviewConfidence}%

**Market Analysis:**
${marketAnalysis}  
**Confidence:** ${marketConfidence}%

**Financial Analysis:**
${financialAnalysis}  
**Confidence:** ${financialConfidence}%

**Strategic Analysis:**
${strategicAnalysis}

### TASK
Based on the above data, create a concise executive brief for ${refinedQuery} that includes:
- A brief summary (under 150 words) highlighting key insights and noting areas with lower confidence.
- 5 specific, actionable questions for investors.

Focus on key insights, potential risks, opportunities, and controversies. Provide concrete and actionable outputs.
    `.trim();
    console.log('Generating final synthesis...');
    const finalSynthesis = await analyzeWithO1(compilationPrompt);
    console.log('Final synthesis complete.');

    // Extract summary and key questions from the final synthesis
    let summary = '';
    let keyQuestions: string[] = [];
    const parts = finalSynthesis.split(/(?=Questions:|Key Questions:)/i);
    if (parts[0]) summary = parts[0].trim();
    if (parts[1]) {
      const questionsText = parts[1];
      keyQuestions = questionsText
        .split(/(?:\d+\.\s*|\n-|\n\*)\s+/)
        .filter(q => q.trim())
        .map(q => q.trim())
        .filter(q => q.endsWith('?'))
        .slice(0, 5);
    }

    // Compile all results with confidence scores
    const results: AnalysisResults = {
      overview,
      overviewConfidence,
      marketAnalysis,
      marketConfidence,
      financialAnalysis,
      financialConfidence,
      strategicAnalysis,
      summary,
      keyQuestions
    };

    // --- Update Usage and Check Limits ---
    const usageResult = await checkAndUpdateUsage(user.id);
    if (!usageResult.canProceed) {
      console.log('Usage limit exceeded after processing.');
      return NextResponse.json({
        error: usageResult.error,
        usageCount: usageResult.usageCount,
        limit: usageResult.limit,
      }, { status: 402 });
    }

    // --- Cache the Results ---
    cache.set(cacheKey, results);
    console.log('Caching results and sending response.');

    // --- Enhance Reporting Transparency ---
    if (
      overviewConfidence < 60 ||
      marketConfidence < 60 ||
      financialConfidence < 60
    ) {
      results.summary += `\n\n**Note:** Some sections of this report have lower confidence scores due to limited available data. For more accurate and detailed information, consider reaching out directly to ${refinedQuery} or exploring additional data sources.`;
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error processing search:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
