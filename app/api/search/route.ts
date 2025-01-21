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
  if (user.isSubscribed) {
    return user.monthlyUsageCount < MONTHLY_LIMIT;
  } else {
    return user.trialUsageCount < TRIAL_LIMIT;
  }
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
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

// For typed prompts
interface IPromptsSet {
  overview: string;
  market: string;
  financial: string;
}
type PersonOrCompany = 'people' | 'company';

// Date objects for experiences
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
  // fallback for extra fields
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
   PARSING & FORMATTING 
-------------------- */
// Basic domain detection
const WEBSITE_REGEX = /\b((https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))/gi;
// Exclude well-known social media domains
const EXCLUDED_DOMAINS = [
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'youtube.com',
  'tiktok.com'
];

function cleanupDomain(raw: string): string {
  let domain = raw.trim();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/\/+$/, '');
  domain = domain.replace(/^www\./i, '');
  return domain;
}
function isExcludedDomain(domain: string): boolean {
  return EXCLUDED_DOMAINS.some((excluded) => domain.includes(excluded));
}

/**
 * Extract only relevant custom domains from the user's LinkedIn data.
 * We skip well-known social sites to focus on actual company/portfolio domains.
 */
function extractRelevantWebsitesFromProfile(profile: IProxycurlProfile): string[] {
  const foundSites = new Set<string>();

  // 1) Scan summary
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
  // 2) Scan experiences[].description
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

/**
 * Convert Proxycurl JSON to a readable snippet for Perplexity
 */
function formatLinkedInData(profile: IProxycurlProfile, name: string): string {
  if (!profile || Object.keys(profile).length === 0) {
    return `No official LinkedIn data found for ${name}. Proceed carefully.`;
  }

  // Build experiences text
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

  // Build education text
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

/**
 * fetchProxycurlData: get the person's LinkedIn data from your local fetchLinkedInProfile route
 */
async function fetchProxycurlData(linkedinUrl: string): Promise<IProxycurlProfile | null> {
  const absoluteUrl = `${BASE_URL}/api/fetchLinkedInProfile?linkedinProfileUrl=${encodeURIComponent(linkedinUrl)}`;
  const res = await fetch(absoluteUrl);
  if (!res.ok) {
    console.error('Proxycurl call failed:', await res.text());
    return null;
  }
  return (await res.json()) as IProxycurlProfile;
}

/**
 * fetchFromPerplexity: call the Perplexity API with a textual prompt
 */
async function fetchFromPerplexity(prompt: string): Promise<string> {
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
  return content;
}

/**
 * analyzeWithO1: call your custom 'o1-mini' model (OpenAI) with a textual prompt
 */
async function analyzeWithO1(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'o1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: 8000,
  });
  if (!response?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from OpenAI API.');
  }
  return response.choices[0].message.content.trim();
}

/* --------------------
   ZOD SCHEMA & ROUTE
-------------------- */
const requestSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['people', 'company']),
  context: z
    .object({
      company: z.string().optional(),
      title: z.string().optional(),
      linkedinUrl: z.string().optional(),
    })
    .optional(),
  disambiguate: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    // 1) Check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2) Usage check
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

    // 3) Parse
    const body = await req.json();
    const { query, type, context, disambiguate } = requestSchema.parse(body);
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }
    let refinedQuery = sanitizedQuery;
    if (context?.company) refinedQuery += ` at ${context.company}`;
    if (context?.title) refinedQuery += `, ${context.title}`;

    // 4) Disambiguation
    if (disambiguate) {
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
      const lines = rawString
        .split('\n')
        .map((l) => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      return NextResponse.json({ suggestions: lines });
    }

    // 5) Cache check
    const cacheKey = `${type}:${refinedQuery}`;
    if (cache.has(cacheKey)) {
      console.log('Cache hit for key:', cacheKey);
      return NextResponse.json(cache.get(cacheKey));
    }

    // 6) If people & we have a linkedinUrl, fetch from Proxycurl
    let linkedInJSON: IProxycurlProfile | null = null;
    if (type === 'people' && context?.linkedinUrl) {
      linkedInJSON = await fetchProxycurlData(context.linkedinUrl);
    }

    // 7) Format snippet
    const officialLinkedInData = formatLinkedInData(linkedInJSON || {}, refinedQuery);

    // 8) Extract custom domains from that profile
    let siteExpansionsText = '';
    if (linkedInJSON) {
      const relevantSites = extractRelevantWebsitesFromProfile(linkedInJSON);
      if (relevantSites.length > 0) {
        // Potentially fetch expansions from Perplexity for each domain
        const expansions: string[] = [];
        for (const domain of relevantSites) {
          // Build a short prompt to ask Perplexity about the domain
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

    // 9) Merge the snippet + site expansions into an "overview" block
    const combinedSnippet = `
[OFFICIAL LINKEDIN SNIPPET]
${officialLinkedInData}

[ADDITIONAL DOMAIN EXPANSIONS]
${siteExpansionsText || 'No custom domains or expansions found.'}
`.trim();

    // 10) Define base prompts
    const basePrompts: Record<PersonOrCompany, IPromptsSet> = {
      people: {
        overview: `# Results for: ${refinedQuery}

## Overview

### Task
Provide a well-structured overview of ${refinedQuery}'s professional background, 
focusing on key roles, achievements, and any relevant background info. 
`,
        market: `## Market Analysis

### Task
Analyze the market environment relevant to ${refinedQuery}, 
discussing competition, trends, and potential opportunities or threats.
`,
        financial: `## Financial Analysis

### Task
If ${refinedQuery} is linked with a startup or funding, 
explore known financial aspects, funding rounds, or potential challenges.
`,
      },
      company: {
        overview: `# Results for: ${refinedQuery}

## Overview

### Task
Provide a thorough overview of the company, ${refinedQuery}, covering:
1. Its industry focus
2. Key products or services
3. Founding year, location, and key team members
4. Any unique market positioning or value proposition
5. Recent milestones or developments
`,
        market: `## Market Analysis

### Task
Discuss the broader market in which ${refinedQuery} competes.
Cover:
1. The company's main competitors
2. Market trends shaping the sector
3. Potential growth opportunities or threats
4. Leadership influence on market position
`,
        financial: `## Financial Analysis

### Task
Evaluate the company's financial posture.
Include:
1. Funding history and investment strategy (if available)
2. Revenue models and profit margins (if known)
3. Recent funding rounds or partnerships
4. Key financial challenges or risks
5. Indicators of overall financial health
`,
      },
    };

    // 11) Build final overview prompt with snippet
    const overviewPrompt = `
[IMPORTANT] Use the official data below as primary truth about ${refinedQuery}.
Ignore conflicting references.

${combinedSnippet}

${basePrompts[type].overview}
`;

    // 12) Market & Financial prompts
    const marketPrompt = basePrompts[type].market;
    const financialPrompt = basePrompts[type].financial;

    // 13) fetch from Perplexity
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexity(overviewPrompt),
      fetchFromPerplexity(marketPrompt),
      fetchFromPerplexity(financialPrompt),
    ]);

    // 14) Pattern recognition
    const patternAnalysisPrompt = `
Analyze the following verified information about ${refinedQuery}:
${overview}
${marketAnalysis}
${financialAnalysis}

### Task
1. Identify non-obvious patterns, relationships, or hidden risks/opportunities.
2. Assess how everything interrelates.
Focus on generating insights without merely restating the above.
`.trim();

    const patternAnalysis = await analyzeWithO1(patternAnalysisPrompt);

    // 15) Strategic analysis
    const strategicAnalysisPrompt = `
Based on the verified information and pattern analysis for ${refinedQuery}:
${patternAnalysis}

### Task
Provide a comprehensive strategic analysis: 
- Leadership impact 
- Growth trajectory
- Risk-opportunity matrix
Offer specific, actionable insights.
`.trim();

    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);

    // 16) Final synthesis
    const finalSynthesisPrompt = `
Create an executive brief based on the analysis of ${refinedQuery}:
${strategicAnalysis}

### Deliverables
1. A concise executive summary
2. Five specific questions for investors
All insights must be concrete & actionable.
`.trim();

    const finalSynthesis = await analyzeWithO1(finalSynthesisPrompt);

    // 17) Parse final output
    let summary = '';
    let keyQuestions: string[] = [];
    const parts = finalSynthesis.split(/(?=Questions:|Key Questions:|Strategic Questions:)/i);
    if (parts[0]) {
      summary = parts[0].replace(/(?:Summary|Executive Summary|Brief):/i, '').trim();
    }
    if (parts[1]) {
      const questionsText = parts[1].replace(/(?:Questions|Key Questions|Strategic Questions):/i, '');
      keyQuestions = questionsText
        .split(/(?:\d+\.|\n-|\n\*)\s+/)
        .filter((q) => q.trim())
        .map((q) => q.trim())
        .filter((q) => q.endsWith('?'))
        .slice(0, 5);
    }

    const results: AnalysisResults = {
      overview,
      marketAnalysis,
      financialAnalysis,
      strategicAnalysis,
      summary,
      keyQuestions,
    };

    // usage deduction
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

    // store in cache & return
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
