// app/api/search/route.ts

export const maxDuration = 300; // 5 minutes

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
function canProceedWithUsage(user: {
  isSubscribed: boolean;
  trialUsageCount: number;
  monthlyUsageCount: number;
}): boolean {
  return user.isSubscribed
    ? user.monthlyUsageCount < MONTHLY_LIMIT
    : user.trialUsageCount < TRIAL_LIMIT;
}
const TRIAL_LIMIT = 5;
const MONTHLY_LIMIT = 30;

/* --------------------
   OPENAI + UTILS
-------------------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function removeCitations(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

/* --------------------
   INTERFACES
-------------------- */
interface AnalysisResults {
  summary: string;
  keyQuestions: string[];
}

interface IPromptsSet {
  overview: string;
  market: string;
  financial: string;
}
type PersonOrCompany = 'people' | 'company';

/* Date & Profile Interfaces */
interface IDateObject {
  day?: number;
  month?: number;
  year?: number;
}

interface IExperience {
  starts_at?: IDateObject;
  ends_at?: IDateObject | null;
  title?: string;
  company?: string;
  description?: string;
  location?: string;
}

interface IEducation {
  starts_at?: IDateObject;
  ends_at?: IDateObject;
  degree_name?: string;
  field_of_study?: string;
  school?: string;
  description?: string;
}

interface IProxycurlProfile {
  full_name?: string;
  summary?: string;
  experiences?: IExperience[];
  education?: IEducation[];
  occupation?: string;
  headline?: string;
  city?: string;
  state?: string;
  country_full_name?: string;
  connections?: number;
  [key: string]: unknown;
}

/* --------------------
   LRU CACHE
-------------------- */
const cache = new LRU<string, AnalysisResults>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

/* --------------------
   DOMAIN EXTRACTION UTILITIES
-------------------- */
const WEBSITE_REGEX = /\b((https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))/gi;
const EXCLUDED_DOMAINS = [
  'linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'youtube.com', 'tiktok.com'
];

function cleanupDomain(raw: string): string {
  let domain = raw.trim();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/\/+$/, '');
  domain = domain.replace(/^www\./i, '');
  return domain;
}

function isExcludedDomain(domain: string): boolean {
  return EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
}

function extractRelevantWebsitesFromProfile(profile: IProxycurlProfile): string[] {
  const foundSites = new Set<string>();

  if (profile.summary) {
    const matches = profile.summary.match(WEBSITE_REGEX);
    if (matches) {
      for (const m of matches) {
        const domain = cleanupDomain(m);
        if (!isExcludedDomain(domain)) {
          foundSites.add(domain);
        }
      }
    }
  }

  if (profile.experiences) {
    for (const exp of profile.experiences) {
      if (exp.description) {
        const matches = exp.description.match(WEBSITE_REGEX);
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
  }

  return Array.from(foundSites);
}

/* --------------------
   DATA FORMATTING
-------------------- */
function formatLinkedInData(profile: IProxycurlProfile, name: string): string {
  if (!profile || Object.keys(profile).length === 0) {
    console.log(`No LinkedIn data found for ${name}`);
    return `No official LinkedIn data found for ${name}. Proceed carefully.`;
  }

  let experiencesText = '';
  if (Array.isArray(profile.experiences)) {
    experiencesText = profile.experiences
      .map((exp) => {
        const startYear = exp.starts_at?.year ?? 'N/A';
        const endYear = exp.ends_at?.year ?? 'Present';
        const role = exp.title ?? 'Unknown Role';
        const company = exp.company ?? 'Unknown Company';
        const desc = exp.description ? `\n   ${exp.description}` : '';
        return `• ${role} at ${company} (${startYear} - ${endYear})${desc}`;
      })
      .join('\n\n');
  }

  let educationText = '';
  if (Array.isArray(profile.education)) {
    educationText = profile.education
      .map((edu) => {
        const startYear = edu.starts_at?.year ?? 'N/A';
        const endYear = edu.ends_at?.year ?? 'N/A';
        const degree = edu.degree_name ?? 'N/A';
        const field = edu.field_of_study ?? 'N/A';
        const school = edu.school ?? 'Unknown School';
        return `• ${degree} in ${field} from ${school} (${startYear} - ${endYear})`;
      })
      .join('\n');
  }

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
${experiencesText || 'No experiences found.'}

Education:
${educationText || 'No education info'}

Location: ${location}
Connections: ${profile.connections ?? 'N/A'}

NOTE: If conflicting data appears elsewhere, disregard it and trust this verified snippet.
`.trim();
}

/* --------------------
   API CALLS
-------------------- */
const BASE_URL = process.env.BASE_URL || 'https://www.vc-vantage.com';

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

async function fetchFromPerplexity(prompt: string): Promise<string> {
  console.log('Sending prompt to Perplexity:', prompt.slice(0, 100) + '...');
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    throw new Error(`Perplexity API Error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from Perplexity API.');
  }
  let content = data.choices[0].message.content.trim();
  content = removeCitations(content);
  console.log('Received response from Perplexity.');
  return content;
}

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
interface SearchContext {
  query: string;
  type: PersonOrCompany;
  company?: string;
  title?: string;
  linkedInData?: string;
}

function validateResponse(content: string, context: SearchContext): boolean {
  console.log('Validating response for context:', context);
  const searchTerms = [context.query];
  if (context.company) searchTerms.push(context.company);

  const paragraphs = content.split('\n\n');
  let relevantParagraphs = 0;
  for (const paragraph of paragraphs) {
    if (searchTerms.some(term => paragraph.toLowerCase().includes(term.toLowerCase()))) {
      relevantParagraphs++;
    }
  }
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

async function fetchFromPerplexityWithValidation(
  prompt: string,
  context: SearchContext
): Promise<string> {
  let response = await fetchFromPerplexity(prompt);
  if (!validateResponse(response, context)) {
    const enhancedPrompt = `
${prompt}

CRITICAL REQUIREMENTS:
1. Focus ONLY on the individual: ${context.query}
${context.company ? `2. Discuss only their work at: ${context.company}` : ''}
${context.title ? `3. Focus on their role as: ${context.title}` : ''}
4. Do NOT discuss or reference any other individuals or companies.
5. Use ONLY information that can be verified from the provided data.

If unsure, say so rather than including unverified details.
`;
    console.log('Retrying with enhanced prompt due to validation failure.');
    response = await fetchFromPerplexity(enhancedPrompt);
  }
  return response;
}
/* --------------------
   ZOD SCHEMA & ROUTE
-------------------- */
const requestSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['people', 'company']),
  context: z.object({
    company: z.string().optional(),
    title: z.string().optional(),
    linkedinUrl: z.string().optional(),
    websiteUrl: z.string().optional(),  // Website URL field
  }).optional(),
  disambiguate: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    console.log('--- New Search Request ---');
    // Authentication and usage checks
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!canProceedWithUsage(user)) {
      return NextResponse.json(
        {
          error: 'Trial limit reached. Please subscribe to continue using VC Vantage.',
          trialLimitReached: true,
          usageCount: user.trialUsageCount,
        },
        { status: 402 }
      );
    }

    // Parse request
    const body = await req.json();
    const { query, type, context, disambiguate } = requestSchema.parse(body);
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }
    let refinedQuery = sanitizedQuery;
    if (context?.company) refinedQuery += ` at ${context.company}`;
    if (context?.title) refinedQuery += `, ${context.title}`;

    // Disambiguation (if requested)
    if (disambiguate) {
      console.log('Performing disambiguation...');
      const disambiguationPrompt = `
You are a strict and concise assistant. We have a person named "${sanitizedQuery}".
We also have optional context: Company = "${context?.company || ''}", Title = "${context?.title || ''}".
Please return up to 3 distinct individuals (by name or identifying info) who match or might be confused with this name/context.
Respond in a short, plain-text list format like:
1. ...
2. ...
3. ...
No disclaimers or extra text. Just the list of possible matches.
If no strong matches, return fewer items or an empty list.
`;
      const rawString = await analyzeWithO1(disambiguationPrompt);
      console.log('Disambiguation raw response:', rawString);
      const lines = rawString
        .split('\n')
        .map((l) => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      console.log('Disambiguation suggestions:', lines);
      return NextResponse.json({ suggestions: lines });
    }

    // Check cache
    const cacheKey = `${type}:${refinedQuery}`;
    if (cache.has(cacheKey)) {
      console.log('Cache hit for key:', cacheKey);
      return NextResponse.json(cache.get(cacheKey));
    }

    // Fetch LinkedIn data if applicable
    let linkedInJSON = null;
    if (type === 'people' && context?.linkedinUrl) {
      linkedInJSON = await fetchProxycurlData(context.linkedinUrl);
    }

    // Format official LinkedIn snippet
    const officialLinkedInData = formatLinkedInData(linkedInJSON || {}, refinedQuery);

    // Extract and expand on custom domains
    let siteExpansionsText = '';
    if (linkedInJSON) {
      const relevantSites = extractRelevantWebsitesFromProfile(linkedInJSON);
      if (relevantSites.length > 0) {
        const expansions: string[] = [];
        for (const domain of relevantSites) {
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

    // Website disambiguation step
    let websiteDisambiguationText = '';
    if (context?.websiteUrl) {
      const websitePrompt = `
We have a website: "${context.websiteUrl}" 
associated with ${refinedQuery}. 
Please provide any relevant corporate information, controversies, or context regarding this website in relation to ${refinedQuery}.
      `;
      websiteDisambiguationText = await fetchFromPerplexity(websitePrompt);
    }

    // Negative corporate information prompt
    const negativeInfoPrompt = `
Is there any negative corporate information relating to ${refinedQuery} or its affiliated entities?
    `;
    const negativeInfo = await fetchFromPerplexity(negativeInfoPrompt);

    // Combine snippets
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

    /* --------------------
       BASE PROMPTS
    -------------------- */
    const basePrompts: Record<PersonOrCompany, IPromptsSet> = {
      people: {
        overview: `Provide an overview of ${refinedQuery}'s professional background focusing on their current role at ${context?.company || 'their company'}. Use ONLY the LinkedIn data provided.`,
        market: `Analyze the market environment for ${refinedQuery} at ${context?.company || 'the company'}, including competitors, industry trends, and growth challenges.`,
        financial: `Evaluate any available financial information related to ${refinedQuery}'s ventures, especially at ${context?.company || 'the company'}.`
      },
      company: {
        overview: `Provide a thorough overview of the company ${refinedQuery}, including industry focus, key products/services, founding year, location, team members, and recent developments.`,
        market: `Discuss the broader market in which ${refinedQuery} competes, including main competitors, market trends, and growth opportunities or threats.`,
        financial: `Evaluate the financial posture of ${refinedQuery}, including funding history, revenue models, recent funding rounds, and key financial challenges.`
      },
    };

    const overviewPrompt = `
Use the data below as the primary source of truth for ${refinedQuery}:
${combinedSnippet}
${basePrompts[type].overview}
    `;
    const marketPrompt = `
Use the data below as the primary source of truth for ${refinedQuery}:
${combinedSnippet}
${basePrompts[type].market}
    `;
    const financialPrompt = `
Use the data below as the primary source of truth for ${refinedQuery}:
${combinedSnippet}
${basePrompts[type].financial}
    `;

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
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexityWithValidation(overviewPrompt, searchContext),
      fetchFromPerplexityWithValidation(marketPrompt, searchContext),
      fetchFromPerplexityWithValidation(financialPrompt, searchContext)
    ]);

    /* --------------------
       COMPOUNDING & FINAL SYNTHESIS
    -------------------- */
    const compilationPrompt = `
We have gathered the following verified information about ${refinedQuery}:

Overview:
${overview}

Market Analysis:
${marketAnalysis}

Financial Analysis:
${financialAnalysis}

### TASK
Based on the above data, create a concise executive brief for ${refinedQuery} that includes:
- A brief summary (under 150 words)
- 5 specific, actionable questions for investors

Focus on key insights, potential risks, opportunities, and controversies. Provide concrete and actionable outputs.
    `;
    const finalSynthesis = await analyzeWithO1(compilationPrompt);

    // Parse final synthesis to separate summary and questions
    let summary = '';
    let keyQuestions: string[] = [];
    const parts = finalSynthesis.split(/(?=Questions:|Key Questions:)/i);
    if (parts[0]) {
      summary = parts[0].trim();
    }
    if (parts[1]) {
      const questionsText = parts[1];
      keyQuestions = questionsText
        .split(/(?:\d+\.|\n-|\n\*)\s+/)
        .filter(q => q.trim())
        .map(q => q.trim())
        .filter(q => q.endsWith('?'))
        .slice(0, 5);
    }

    const results: AnalysisResults = { summary, keyQuestions };

    const usageResult = await checkAndUpdateUsage(user.id);
    if (!usageResult.canProceed) {
      return NextResponse.json(
        {
          error: usageResult.error,
          usageCount: usageResult.usageCount,
          limit: usageResult.limit,
        },
        { status: 402 }
      );
    }

    cache.set(cacheKey, results);
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
