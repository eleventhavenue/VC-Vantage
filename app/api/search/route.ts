// app/api/search/route.ts

export const maxDuration = 300; // Increased to 5 minutes

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import LRU from 'lru-cache';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { checkAndUpdateUsage } from '@/lib/usage-utils';

// Some usage-check function
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function removeCitations(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

interface AnalysisResults {
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

interface IPromptsSet {
  overview: string;
  market: string;
  financial: string;
}
type PersonOrCompany = 'people' | 'company';

// *** NEW: Define interfaces to avoid 'any' ***
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
  // add any other fields from Proxycurl if needed
}

interface IEducation {
  starts_at?: IDateObject;
  ends_at?: IDateObject;
  degree_name?: string;
  field_of_study?: string;
  school?: string;
  description?: string;
  // add any other fields from Proxycurl
}

interface IProxycurlProfile {
  full_name?: string;
  occupation?: string;
  headline?: string;
  summary?: string;
  experiences?: IExperience[];
  education?: IEducation[];
  city?: string;
  state?: string;
  country_full_name?: string;
  connections?: number;
  // fallback
  [key: string]: unknown;
}

// LRU Cache
const cache = new LRU<string, AnalysisResults>({
  max: 500,
  ttl: 1000 * 60 * 60,
});

// formatLinkedInData with typed arrays
function formatLinkedInData(profile: IProxycurlProfile, name: string): string {
  if (!profile || Object.keys(profile).length === 0) {
    return `No official LinkedIn data found for ${name}. Proceed carefully.`;
  }

  let experiencesText = '';
  if (Array.isArray(profile.experiences)) {
    experiencesText = profile.experiences
      .map((exp: IExperience) => {
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
      .map((edu: IEducation) => {
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

// Base URL for server-side fetch
const BASE_URL = process.env.BASE_URL || 'https://www.vc-vantage.com';

async function fetchProxycurlData(linkedinUrl: string): Promise<IProxycurlProfile | null> {
  const absoluteUrl = `${BASE_URL}/api/fetchLinkedInProfile?linkedinProfileUrl=${encodeURIComponent(linkedinUrl)}`;
  const res = await fetch(absoluteUrl);
  if (!res.ok) {
    console.error('Proxycurl call failed:', await res.text());
    return null;
  }
  return (await res.json()) as IProxycurlProfile;
}

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

    const body = await req.json();
    const { query, type, context, disambiguate } = requestSchema.parse(body);

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const sanitizedQuery = query.trim();
    let refinedQuery = sanitizedQuery;
    if (context?.company) refinedQuery += ` at ${context.company}`;
    if (context?.title) refinedQuery += `, ${context.title}`;

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

    const cacheKey = `${type}:${refinedQuery}`;
    if (cache.has(cacheKey)) {
      console.log('Cache hit for key:', cacheKey);
      return NextResponse.json(cache.get(cacheKey));
    }

    let linkedInJSON: IProxycurlProfile | null = null;
    if (type === 'people' && context?.linkedinUrl) {
      linkedInJSON = await fetchProxycurlData(context.linkedinUrl);
    }

    const officialLinkedInData = formatLinkedInData(linkedInJSON || {}, refinedQuery);

    // Base prompts
    const basePrompts: Record<PersonOrCompany, IPromptsSet> = {
      people: {
        overview: `# Results for: ${refinedQuery}

## Overview

### Task
Provide a well-structured overview of ${refinedQuery}'s professional background, industry focus, market involvement, and any notable achievements or activities.
Focus on:
1. Their core area of expertise or leadership
2. Notable career milestones
3. Any current roles or leadership positions
4. Recent developments or contributions in their field
`,
        market: `## Market Analysis

### Task
Analyze the market and competitive landscape relevant to ${refinedQuery}'s domain.
Include:
1. The sector(s) ${refinedQuery} operates in
2. Key competitors or industry peers
3. Emerging trends that could affect ${refinedQuery}'s position
4. Potential opportunities and threats
`,
        financial: `## Financial Analysis

### Task
If ${refinedQuery} is linked with a startup or investment entity, explore any financial or funding aspects.
Focus on:
1. Funding history (if applicable)
2. Revenue streams and profitability
3. Known investors or relevant fundraising rounds
4. Risks or financial challenges
5. Overall financial positioning
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

    // Merge the official snippet into the overview prompt
    const overviewPrompt = `
[IMPORTANT] Use the official data below as primary truth about ${refinedQuery}.
Ignore any conflicting references.

${officialLinkedInData}

${basePrompts[type].overview}
`;

    const marketPrompt = basePrompts[type].market;
    const financialPrompt = basePrompts[type].financial;

    // fetch from Perplexity
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexity(overviewPrompt),
      fetchFromPerplexity(marketPrompt),
      fetchFromPerplexity(financialPrompt),
    ]);

    // Pattern recognition
    const patternAnalysisPrompt = `Analyze the following verified information about ${refinedQuery}:
${overview}
${marketAnalysis}
${financialAnalysis}

### Task
1. Identify non-obvious patterns, relationships, and interdependencies.
2. Find hidden risks or opportunities that might not be immediately apparent.
3. Assess how market position, financial status, and strategic decisions interrelate.
4. Evaluate the sustainability of competitive advantages.
5. Gauge how ${refinedQuery}'s leadership or strategy aligns with broader market trends.

Focus on generating insights without merely restating the above.
`;

    const patternAnalysis = await analyzeWithO1(patternAnalysisPrompt);

    // Strategic analysis
    const strategicAnalysisPrompt = `Based on the verified information and the following pattern analysis for ${refinedQuery}:
${patternAnalysis}

### Task
Provide a comprehensive strategic analysis that covers:
1. Leadership impact: Evaluate the effectiveness of strategic decisions, execution quality, and vision alignment with market opportunities.
2. Growth trajectory: Assess scalability, innovation potential, potential market expansion paths, and competitive durability.
3. Risk-opportunity matrix: Identify strategic risks, market opportunities, execution challenges, and growth catalysts.

Offer specific, actionable insights rather than broad or generic commentary.
`;

    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);

    // Final synthesis
    const finalSynthesisPrompt = `Create an executive brief based on the following analysis of ${refinedQuery}:
${strategicAnalysis}

### Deliverables
1. A concise executive summary highlighting:
   - Key strategic insights
   - Critical success factors
   - Major risks and opportunities
   - Strength of competitive positioning

2. Five highly specific questions a venture capitalist or investor might ask, focusing on:
   - Validation of growth assumptions
   - Testing strategic hypotheses
   - Assessment of execution capabilities
   - Risk mitigation strategies
   - Understanding of unique competitive advantages

Ensure all insights are concrete and actionable.
`;

    const finalSynthesis = await analyzeWithO1(finalSynthesisPrompt);

    // Parse final output
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
        .filter(q => q.trim())
        .map(q => q.trim())
        .filter(q => q.endsWith('?'))
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

    cache.set(cacheKey, results);
    return NextResponse.json(results);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }
    console.error('Error processing search:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
