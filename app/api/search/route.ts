// app/api/search/route.ts

export const maxDuration = 300; // Increased to 5 minutes for o1 processing

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import LRU from 'lru-cache';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { checkAndUpdateUsage } from '@/lib/usage-utils';

function canProceedWithUsage(user: {
  isSubscribed: boolean;
  trialUsageCount: number;
  monthlyUsageCount: number;
}): boolean {
  if (user.isSubscribed) {
    // For paying users, compare monthlyUsageCount to your monthly limit
    return user.monthlyUsageCount < MONTHLY_LIMIT;
  } else {
    // For trial users, compare trialUsageCount to the 5-use limit
    return user.trialUsageCount < TRIAL_LIMIT;
  }
}


// Constants
const TRIAL_LIMIT = 5;
const MONTHLY_LIMIT = 30;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
function removeCitations(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

// Initialize LRU Cache
const cache = new LRU<string, AnalysisResults>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

interface AnalysisResults {
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

async function fetchFromPerplexity(prompt: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}`,
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

// Extend schema to include optional context and disambiguation flag
const requestSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['people', 'company']),
  context: z.object({
    company: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
  disambiguate: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user and check subscription status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Preliminary usage check
    if (!canProceedWithUsage(user)) {
      return NextResponse.json({
        error: 'Trial limit reached. Please subscribe to continue using VC Vantage.',
        trialLimitReached: true,
        usageCount: user.trialUsageCount,
      }, { status: 402 });
    }

    // Parse and validate request
    const body = await req.json();
    const { query, type, context, disambiguate } = requestSchema.parse(body);

    if (!query?.trim() || !type) {
      return NextResponse.json({ error: 'Query and type parameters are required.' }, { status: 400 });
    }

    const sanitizedQuery = query.trim();
    let refinedQuery = sanitizedQuery;
    if (context?.company) refinedQuery += ` at ${context.company}`;
    if (context?.title) refinedQuery += `, ${context.title}`;

    // If disambiguation is requested, perform preliminary lookup
    if (disambiguate) {
      const disambiguationPrompt = `
    You are a strict and concise assistant. We have a person named "${sanitizedQuery}".
    We also have optional context: Company = "${context?.company || ""}", Title = "${context?.title || ""}".
    Please return up to 3 distinct individuals (by name or identifying info) who match or might be confused with this name/context.
    Respond in a short, plain-text list format like:
    1. ...
    2. ...
    3. ...
    No disclaimers or extra text. Just the list of possible matches.
    If no strong matches, return fewer items or an empty list.
    `;
    
      const rawString = await analyzeWithO1(disambiguationPrompt);
    
      // Parse the AI's response into an array
      // e.g. "1. John Doe\n2. John C. Doe\n3. Jonathan Doe"
      // We'll do a simple split on new lines or numbered lines:
      const lines = rawString
        .split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim()) // remove "1. " prefix
        .filter(Boolean); // remove empty lines
    
      return NextResponse.json({ suggestions: lines });
    }
    
    

    // Use a combined cache key including type and refinedQuery
    const cacheKey = `${type}:${refinedQuery}`;
    if (cache.has(cacheKey)) {
      console.log('Cache hit for key:', cacheKey);
      return NextResponse.json(cache.get(cacheKey));
    }

    const basePrompts = {
      people: {
        overview: `# Results for: ${refinedQuery}
    
## Overview

### Industry and Focus
Provide a detailed description of ${refinedQuery}'s industry focus, including the sectors they invest in and their strategic approach.

### Market Position
Analyze ${refinedQuery}'s position in the market, highlighting their unique value propositions and how they differentiate themselves from competitors.

### Founding and Team
List the founding year, location, and key team members of ${refinedQuery}. Include brief professional backgrounds and their roles within the firm.

### Key Milestones
Detail significant milestones achieved by ${refinedQuery}, such as fund closures, major investments, and partnerships.

### Recent Developments
Summarize the latest activities and developments involving ${refinedQuery}, including new investments and strategic initiatives.

### Mission and Support
Explain the mission of ${refinedQuery} and the support services they offer to their portfolio companies beyond capital investment.

### LinkedIn Profile
Incorporate information from ${refinedQuery}'s LinkedIn profile to ensure accuracy in employment history, roles, and professional achievements. If a LinkedIn profile is unavailable, use other reputable sources such as official company websites, press releases, and professional biographies to provide accurate information.`,
        
        market: `## Market Analysis
    
### Market and Competitive Landscape
Provide an analysis of the market and competitive landscape in which ${refinedQuery} operates.
    
### Key Competitors
Identify and describe the key competitors of ${refinedQuery}.
    
### Emerging Market Trends
Discuss the emerging market trends relevant to ${refinedQuery}'s focus areas.
    
### Leadership Influence
Analyze how the leadership team of ${refinedQuery} influences its market position.
    
### Potential Threats and Opportunities
Identify potential threats and opportunities facing ${refinedQuery} in the current market.`,
        
        financial: `## Financial Analysis
    
### Funding History
Detail the funding history of ${refinedQuery}, including previous funds raised and key investors.
    
### Investment Strategy and Funding Rounds
Describe ${refinedQuery}'s investment strategy and the typical funding rounds they participate in.
    
### Revenue Streams
Explain the revenue streams of ${refinedQuery}, if applicable.
    
### Profitability
Assess the profitability of ${refinedQuery}, including key financial metrics.
    
### Recent Funding Rounds and Investor Profiles
Provide information on recent funding rounds and the profiles of new investors.
    
### Financial Challenges and Risks
Identify any financial challenges and risks faced by ${refinedQuery}.
    
### Market Trends and Opportunities
Discuss how current market trends present opportunities or challenges for ${refinedQuery}.
    
### Financial Health Indicators
Summarize key financial health indicators for ${refinedQuery}.`
      },
    
      company: {
        overview: `# Results for: ${refinedQuery}
    
## Overview
    
### Industry and Focus
Provide a detailed description of ${refinedQuery}'s industry focus, including the sectors they operate in and their strategic approach.
    
### Market Position
Analyze ${refinedQuery}'s position in the market, highlighting their unique value propositions and how they differentiate themselves from competitors.
    
### Founding and Team
List the founding year, location, and key team members of ${refinedQuery}. Include brief professional backgrounds and their roles within the company.
    
### Key Milestones
Detail significant milestones achieved by ${refinedQuery}, such as product launches, market expansions, and partnerships.
    
### Recent Developments
Summarize the latest activities and developments involving ${refinedQuery}, including new products and strategic initiatives.
    
### Mission and Support
Explain the mission of ${refinedQuery} and the support services they offer to their customers beyond their core products.
    
### LinkedIn Profile
Incorporate information from ${refinedQuery}'s LinkedIn profile to ensure accuracy in company history, leadership roles, and strategic initiatives. If a LinkedIn profile is unavailable, use other reputable sources such as official company websites and press releases to provide accurate information.`,
        
        market: `## Market Analysis
    
### Market and Competitive Landscape
Provide an analysis of the market and competitive landscape in which ${refinedQuery} operates.
    
### Key Competitors
Identify and describe the key competitors of ${refinedQuery}.
    
### Emerging Market Trends
Discuss the emerging market trends relevant to ${refinedQuery}'s focus areas.
    
### Leadership Influence
Analyze how the leadership team of ${refinedQuery} influences its market position.
    
### Potential Threats and Opportunities
Identify potential threats and opportunities facing ${refinedQuery} in the current market.`,
        
        financial: `## Financial Analysis
    
### Funding History
Detail the funding history of ${refinedQuery}, including previous funding rounds and key investors.
    
### Investment Strategy and Funding Rounds
Describe ${refinedQuery}'s investment strategy and the typical funding rounds they participate in.
    
### Revenue Streams
Explain the revenue streams of ${refinedQuery}, if applicable.
    
### Profitability
Assess the profitability of ${refinedQuery}, including key financial metrics.
    
### Recent Funding Rounds and Investor Profiles
Provide information on recent funding rounds and the profiles of new investors.
    
### Financial Challenges and Risks
Identify any financial challenges and risks faced by ${refinedQuery}.
    
### Market Trends and Opportunities
Discuss how current market trends present opportunities or challenges for ${refinedQuery}.
    
### Financial Health Indicators
Summarize key financial health indicators for ${refinedQuery}.`
      }
    };

    const selectedPrompts = basePrompts[type as keyof typeof basePrompts];

    // Step 1: Gather factual information using Perplexity
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexity(selectedPrompts.overview),
      fetchFromPerplexity(selectedPrompts.market),
      fetchFromPerplexity(selectedPrompts.financial),
    ]);

    // Step 2: Pattern Recognition
    const patternAnalysisPrompt = `Analyze the following verified information about ${refinedQuery}:
${overview}
${marketAnalysis}
${financialAnalysis}
Your task:
1. Identify non-obvious patterns and relationships.
2. Find hidden risks and opportunities.
3. Analyze interconnections between market position, financial performance, and strategic decisions.
4. Evaluate sustainability of competitive advantages.
5. Assess positioning relative to market trends.
Focus exclusively on generating insights without restating the given information.`;

    const patternAnalysis = await analyzeWithO1(patternAnalysisPrompt);

    // Step 3: Strategic Deep Dive
    const strategicAnalysisPrompt = `Based on the verified information and the following pattern analysis for ${refinedQuery}:
${patternAnalysis}
Provide a comprehensive strategic analysis focusing on:
- Leadership impact: Evaluate effectiveness of strategic decisions, quality of execution, and vision alignment with market opportunities.
- Growth trajectory: Assess scalability, innovation potential, market expansion vectors, and competitive durability.
- Risk-opportunity matrix: Identify strategic risks, market opportunities, execution challenges, and growth catalysts.
Provide specific, actionable insights rather than general observations.`;

    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);

    // Step 4: Final synthesis
    const finalSynthesisPrompt = `Create an executive brief based on the following analysis of ${refinedQuery}:
${strategicAnalysis}
Deliverables:
1. A concise executive summary that highlights:
   - Most significant strategic insights
   - Critical success factors
   - Key risks and opportunities
   - Competitive positioning strength
2. Five highly specific questions that venture capitalists should ask, focusing on:
   - Validation of growth assumptions
   - Testing of strategic hypotheses
   - Assessment of execution capabilities
   - Evaluation of risk mitigation strategies
   - Understanding of competitive advantages
Make sure all insights are specific and actionable.`;

    const finalSynthesis = await analyzeWithO1(finalSynthesisPrompt);

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

    // Final usage update/deduction
    const usageResult = await checkAndUpdateUsage(user.id);
    if (!usageResult.canProceed) {
      return NextResponse.json({
        error: usageResult.error,
        usageCount: usageResult.usageCount,
        limit: usageResult.limit
      }, { status: 402 });
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
