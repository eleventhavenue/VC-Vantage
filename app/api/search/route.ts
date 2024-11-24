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
    max_completion_tokens: 8000,
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

    // Step 2: First o1 analysis phase - Pattern Recognition
  const patternAnalysisPrompt = `Analyze the following verified information about ${sanitizedQuery}:

  ${overview}
  
  ${marketAnalysis}
  
  ${financialAnalysis}
  
  Your task is to:
  1. Identify non-obvious patterns and relationships between different aspects of the business
  2. Find potential hidden risks and opportunities not explicitly stated
  3. Analyze the interconnections between market position, financial performance, and strategic decisions
  4. Evaluate the sustainability of current competitive advantages
  5. Assess the company's positioning relative to major market trends
  
  Focus exclusively on pattern recognition and insight generation. Do not restate the provided information.`;
  
    const patternAnalysis = await analyzeWithO1(patternAnalysisPrompt);
  
    // Step 3: Second o1 analysis phase - Strategic Deep Dive
    const strategicAnalysisPrompt = `Based on both the verified information and the pattern analysis below, provide a comprehensive strategic analysis of ${sanitizedQuery}.
  
  PATTERN ANALYSIS:
  ${patternAnalysis}
  
  VERIFIED INFORMATION:
  - Overview: ${overview}
  - Market: ${marketAnalysis}
  - Financial: ${financialAnalysis}
  
  Focus on:
  1. Leadership Impact
     - Effectiveness of strategic decisions
     - Quality of execution
     - Vision alignment with market opportunities
  
  2. Growth Trajectory
     - Scalability assessment
     - Innovation potential
     - Market expansion vectors
     - Competitive durability
  
  3. Risk-Opportunity Matrix
     - Strategic risks
     - Market opportunities
     - Execution challenges
     - Growth catalysts
  
  Provide specific, actionable insights rather than general observations.`;
  
    const strategicAnalysis = await analyzeWithO1(strategicAnalysisPrompt);
  
    // Step 4: Final o1 synthesis phase - Executive Brief
    const finalSynthesisPrompt = `Create an executive brief based on the following analysis of ${sanitizedQuery}:
  
  ${strategicAnalysis}
  
  Deliver:
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
  
  Make all insights specific and actionable. Avoid general statements.`;
  
    const finalSynthesis = await analyzeWithO1(finalSynthesisPrompt);
  
    // Parse the final synthesis (improved parsing)
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