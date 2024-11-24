// app/api/search/route.ts

export const maxDuration = 60; // Increased to 5 minutes for o1 processing

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import LRU from 'lru-cache';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

  return data.choices[0].message.content.trim();
}

async function analyzeWithO1(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'o1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: 4000,
  });

  if (!response?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response structure from OpenAI API.');
  }

  return response.choices[0].message.content.trim();
}

export async function POST(req: Request) {
  try {
    const { query, type } = await req.json();

    if (!query?.trim() || !type) {
      return NextResponse.json({ error: 'Query and type parameters are required.' }, { status: 400 });
    }

    const sanitizedQuery = query.trim();

    if (type !== 'people' && type !== 'company') {
      return NextResponse.json({ error: 'Type must be either "people" or "company".' }, { status: 400 });
    }

    if (cache.has(sanitizedQuery)) {
      console.log('Cache hit for query:', sanitizedQuery);
      return NextResponse.json(cache.get(sanitizedQuery));
    }

    // Keep your detailed prompts structure
    const basePrompts = {
      people: {
        overview: `# Results for: ${sanitizedQuery}

## Overview

### Industry and Focus
Provide a detailed description of ${sanitizedQuery}'s industry focus, including the sectors they invest in and their strategic approach.

### Market Position
Analyze ${sanitizedQuery}'s position in the market, highlighting their unique value propositions and how they differentiate themselves from competitors.

### Founding and Team
List the founding year, location, and key team members of ${sanitizedQuery}. Include brief professional backgrounds and their roles within the firm.

### Key Milestones
Detail significant milestones achieved by ${sanitizedQuery}, such as fund closures, major investments, and partnerships.

### Recent Developments
Summarize the latest activities and developments involving ${sanitizedQuery}, including new investments and strategic initiatives.

### Mission and Support
Explain the mission of ${sanitizedQuery} and the support services they offer to their portfolio companies beyond capital investment.`,

        market: `## Market Analysis

### Market and Competitive Landscape
Provide an analysis of the market and competitive landscape in which ${sanitizedQuery} operates.

### Key Competitors
Identify and describe the key competitors of ${sanitizedQuery}.

### Emerging Market Trends
Discuss the emerging market trends relevant to ${sanitizedQuery}'s focus areas.

### Leadership Influence
Analyze how the leadership team of ${sanitizedQuery} influences its market position.

### Potential Threats and Opportunities
Identify potential threats and opportunities facing ${sanitizedQuery} in the current market.`,

        financial: `## Financial Analysis

### Funding History
Detail the funding history of ${sanitizedQuery}, including previous funds raised and key investors.

### Investment Strategy and Funding Rounds
Describe ${sanitizedQuery}'s investment strategy and the typical funding rounds they participate in.

### Revenue Streams
Explain the revenue streams of ${sanitizedQuery}, if applicable.

### Profitability
Assess the profitability of ${sanitizedQuery}, including key financial metrics.

### Recent Funding Rounds and Investor Profiles
Provide information on recent funding rounds and the profiles of new investors.

### Financial Challenges and Risks
Identify any financial challenges and risks faced by ${sanitizedQuery}.

### Market Trends and Opportunities
Discuss how current market trends present opportunities or challenges for ${sanitizedQuery}.

### Financial Health Indicators
Summarize key financial health indicators for ${sanitizedQuery}.`
      },
      company: {
        overview: `# Results for: ${sanitizedQuery}

## Overview

### Industry and Focus
Provide a detailed description of ${sanitizedQuery}'s industry focus, including the sectors they operate in and their strategic approach.

### Market Position
Analyze ${sanitizedQuery}'s position in the market, highlighting their unique value propositions and how they differentiate themselves from competitors.

### Founding and Team
List the founding year, location, and key team members of ${sanitizedQuery}. Include brief professional backgrounds and their roles within the company.

### Key Milestones
Detail significant milestones achieved by ${sanitizedQuery}, such as product launches, market expansions, and partnerships.

### Recent Developments
Summarize the latest activities and developments involving ${sanitizedQuery}, including new products and strategic initiatives.

### Mission and Support
Explain the mission of ${sanitizedQuery} and the support services they offer to their customers beyond their core products.`,

        market: `## Market Analysis

### Market and Competitive Landscape
Provide an analysis of the market and competitive landscape in which ${sanitizedQuery} operates.

### Key Competitors
Identify and describe the key competitors of ${sanitizedQuery}.

### Emerging Market Trends
Discuss the emerging market trends relevant to ${sanitizedQuery}'s focus areas.

### Leadership Influence
Analyze how the leadership team of ${sanitizedQuery} influences its market position.

### Potential Threats and Opportunities
Identify potential threats and opportunities facing ${sanitizedQuery} in the current market.`,

        financial: `## Financial Analysis

### Funding History
Detail the funding history of ${sanitizedQuery}, including previous funding rounds and key investors.

### Investment Strategy and Funding Rounds
Describe ${sanitizedQuery}'s investment strategy and the typical funding rounds they participate in.

### Revenue Streams
Explain the revenue streams of ${sanitizedQuery}, if applicable.

### Profitability
Assess the profitability of ${sanitizedQuery}, including key financial metrics.

### Recent Funding Rounds and Investor Profiles
Provide information on recent funding rounds and the profiles of new investors.

### Financial Challenges and Risks
Identify any financial challenges and risks faced by ${sanitizedQuery}.

### Market Trends and Opportunities
Discuss how current market trends present opportunities or challenges for ${sanitizedQuery}.

### Financial Health Indicators
Summarize key financial health indicators for ${sanitizedQuery}.`
      }
    };

    const selectedPrompts = basePrompts[type as keyof typeof basePrompts];

    // Step 1: Gather factual information using Perplexity
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexity(selectedPrompts.overview),
      fetchFromPerplexity(selectedPrompts.market),
      fetchFromPerplexity(selectedPrompts.financial),
    ]);

    // Step 2: Strategic Analysis with o1-mini
    const strategicAnalysisPrompt = `Based on the following verified information about ${sanitizedQuery}:

OVERVIEW:
${overview}

MARKET ANALYSIS:
${marketAnalysis}

FINANCIAL ANALYSIS:
${financialAnalysis}

Please provide a detailed strategic analysis covering:

1. Leadership Impact
- How the leadership team impacts strategic direction and success

2. Long-term Growth Potential
- Scalability of the business model
- Innovation capacity and adaptability
- Market expansion opportunities
- Competitive resilience

Focus on drawing meaningful conclusions from the provided facts rather than introducing new information.`;

    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);

    // Step 3: Final Summary and Key Questions with o1-mini
    const finalSynthesisPrompt = `Based on the following comprehensive analysis of ${sanitizedQuery}:

STRATEGIC ANALYSIS:
${strategicAnalysis}

Please provide:
1. A concise executive summary highlighting the most critical insights and strategic implications
2. Five specific, thoughtful questions that venture capitalists should ask when evaluating this ${type}

Focus on synthesizing the most important insights and formulating questions that probe key risks and opportunities.`;

    const finalSynthesis = await analyzeWithO1(finalSynthesisPrompt);

    // Parse the final synthesis
    let summary = '';
    let keyQuestions: string[] = [];

    const [summarySection, questionsSection] = finalSynthesis.split(/(?=Questions:|Key Questions:)/i);
    
    if (summarySection) {
      summary = summarySection.trim();
    }

    if (questionsSection) {
      keyQuestions = questionsSection
        .replace(/(?:Questions:|Key Questions:)/i, '')
        .split(/(?:\d+\.|\n-|\n\*)\s+/)
        .filter(q => q.trim())
        .map(q => q.trim())
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

    cache.set(sanitizedQuery, results);
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error processing search:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}