// app/api/search/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import LRU from 'lru-cache';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize LRU Cache
const cache = new LRU<string, AnalysisResults>({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 60, // 1 hour in milliseconds
});

interface AnalysisResults {
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

// Define fetchFromPerplexity function
async function fetchFromPerplexity(prompt: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API Error: ${response.statusText}`);
  }

  const data = await response.json();

  if (
    !data ||
    !data.choices ||
    !Array.isArray(data.choices) ||
    data.choices.length === 0 ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    throw new Error('Invalid response structure from Perplexity API.');
  }

  return data.choices[0].message.content.trim();
}

// Define fetchFromOpenAI function
async function fetchFromOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  if (
    !response ||
    !response.choices ||
    !Array.isArray(response.choices) ||
    response.choices.length === 0 ||
    !response.choices[0].message ||
    !response.choices[0].message.content
  ) {
    throw new Error('Invalid response structure from OpenAI API.');
  }

  return response.choices[0].message.content.trim();
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
    }

    const sanitizedQuery = query.trim();

    // Check cache
    if (cache.has(sanitizedQuery)) {
      console.log('Cache hit for query:', sanitizedQuery);
      return NextResponse.json(cache.get(sanitizedQuery));
    }

    // Define prompts
    const overviewPrompt = `# Results for: ${sanitizedQuery}

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
Explain the mission of ${sanitizedQuery} and the support services they offer to their portfolio companies beyond capital investment.
`;

    const marketAnalysisPrompt = `## Market Analysis

### Market and Competitive Landscape
Provide an analysis of the market and competitive landscape in which ${sanitizedQuery} operates.

### Key Competitors
Identify and describe the key competitors of ${sanitizedQuery}.

### Emerging Market Trends
Discuss the emerging market trends relevant to ${sanitizedQuery}'s focus areas.

### Leadership Influence
Analyze how the leadership team of ${sanitizedQuery} influences its market position.

### Potential Threats and Opportunities
Identify potential threats and opportunities facing ${sanitizedQuery} in the current market.
`;

    const financialAnalysisPrompt = `## Financial Analysis

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
Summarize key financial health indicators for ${sanitizedQuery}.
`;

    // Fetch data concurrently
    const [overview, marketAnalysis, financialAnalysis] = await Promise.all([
      fetchFromPerplexity(overviewPrompt),
      fetchFromPerplexity(marketAnalysisPrompt),
      fetchFromPerplexity(financialAnalysisPrompt),
    ]);

    // Strategic Analysis via OpenAI
    const strategicAnalysisPrompt = `## Strategic Analysis

### Leadership Impact
Analyze how the leadership team of ${sanitizedQuery} impacts its strategic direction and success.

### Long-term Growth Potential

#### Scalability
Evaluate the scalability of ${sanitizedQuery}'s business model.

#### Innovation Capacity
Assess the innovation capacity of ${sanitizedQuery} and its potential to adapt to market changes.

#### Market Expansion Opportunities
Identify opportunities for ${sanitizedQuery} to expand into new markets or sectors.

#### Resilience against Competitive Pressures
Analyze how ${sanitizedQuery} can maintain resilience against competitive pressures.
`;

    const strategicAnalysis = await fetchFromOpenAI(strategicAnalysisPrompt);

    // Summary and Key Questions via OpenAI
    const summaryPrompt = `Please provide a **Summary** of the strategic analysis of **${sanitizedQuery}**. Additionally, generate **five critical questions** that venture capitalists should consider when evaluating this company for investment. Focus on identifying potential risks, uncovering opportunities, and areas requiring further due diligence.

Format the response using Markdown with headings and bullet points.
`;

    const summaryResponse = await fetchFromOpenAI(summaryPrompt);

    // Extract summary and key questions
    let summary: string = '';
    let keyQuestions: string[] = [];

    if (summaryResponse) {
      // Assuming the response is in markdown with headings and bullet points
      // Split into summary and key questions based on heading
      const summarySplit = summaryResponse.split('**Five Critical Questions**');

      if (summarySplit.length === 2) {
        summary = summarySplit[0].replace('**Summary**', '').trim();
        const questionsText = summarySplit[1].replace('**Five Critical Questions**', '').trim();
        keyQuestions = questionsText
          .split('\n')
          .filter(line => line.startsWith('- ') || /^\d+\./.test(line))
          .map(line => line.replace(/^(-\s*|\d+\.\s*)/, '').trim());
      } else {
        // If the assistant didn't format correctly, attempt to extract
        // For simplicity, assume the entire response is summary and key questions are empty
        summary = summaryResponse;
      }
    }

    // Compile results
    const results: AnalysisResults = {
      overview,
      marketAnalysis,
      financialAnalysis,
      strategicAnalysis,
      summary,
      keyQuestions,
    };

    // Store in cache
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
