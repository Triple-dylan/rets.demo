import { NextRequest, NextResponse } from 'next/server';

let openai: any = null;

try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI not available, using mock responses');
}

// Real estate intelligence system prompts
const SYSTEM_PROMPT = `You are RETS AI, an expert commercial real estate assistant with deep knowledge of:

- Property analysis and underwriting
- Market trends and comparable sales
- Financial modeling and investment analysis
- Due diligence processes
- Offering memorandum creation
- Letter of intent drafting
- Seattle and Pacific Northwest markets

You provide intelligent, data-driven advice to commercial real estate professionals and investors. Always be professional, concise, and focus on actionable insights.

When users ask about properties, provide detailed analysis. When they request financial models or documents, guide them through the process and highlight key considerations.`;

const KNOWLEDGE_BASE = `
Seattle Commercial Real Estate Market Context:
- Strong tech sector driving demand
- Average multifamily cap rates: 4.0-6.0%
- Typical price per unit: $200K-$400K
- Rental growth: 3-5% annually
- Key submarkets: Capitol Hill, Queen Anne, Ballard, South Lake Union
- Major employers: Amazon, Microsoft, Google, Meta, Boeing
- Population growth: 1-2% annually
- Limited new supply in urban core
- Strong public transportation infrastructure
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';
    
    let response = '';
    let useOpenAI = false;

    try {
      // Use OpenAI if API key is configured
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        useOpenAI = true;
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT + "\n\n" + KNOWLEDGE_BASE
            },
            ...messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          max_tokens: 800,
          temperature: 0.7,
        });
        
        response = completion.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.log('OpenAI API error, falling back to enhanced mock responses:', error);
      useOpenAI = false;
    }
    
    // Enhanced mock responses if OpenAI is not available
    if (!useOpenAI || !response) {
      response = generateIntelligentMockResponse(userMessage);
    }

    // Simulate thinking delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      message: response,
      role: 'assistant',
      powered_by: useOpenAI ? 'openai' : 'mock'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateIntelligentMockResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  // Property search queries
  if (msg.includes('find') || msg.includes('properties') || msg.includes('search') || msg.includes('seattle')) {
    return `I've identified several multifamily properties in Seattle that match your criteria. The market is showing strong fundamentals with cap rates ranging from 4.0% to 6.0%. 

Key highlights from the search:
• ${Math.floor(Math.random() * 8) + 3} properties in your target range
• Average price per unit: $${(Math.random() * 100 + 200).toFixed(0)}K
• Strong rental growth potential in these submarkets
• Proximity to major employment centers

Would you like me to run detailed underwriting analysis on any of these properties?`;
  }
  
  // Underwriting and financial analysis
  if (msg.includes('underwriting') || msg.includes('financial') || msg.includes('model') || msg.includes('analysis')) {
    return `I've completed a comprehensive financial analysis including:

**Key Metrics:**
• Cap Rate: ${(Math.random() * 2 + 4).toFixed(2)}%
• Cash-on-Cash Return: ${(Math.random() * 4 + 8).toFixed(1)}%
• IRR: ${(Math.random() * 6 + 10).toFixed(1)}%

**Analysis Highlights:**
• Strong NOI growth potential through operational improvements
• Market rents below current comparables suggest upside
• Seattle submarket fundamentals support value appreciation

The 10-year projections show compelling returns. Would you like me to generate the detailed Excel financial model for download?`;
  }
  
  // Document generation
  if (msg.includes('loi') || msg.includes('letter') || msg.includes('offer')) {
    return `I've prepared a comprehensive Letter of Intent template tailored to this acquisition. Key terms included:

• Purchase price and earnest money
• Inspection and due diligence timeline
• Financing contingencies
• Standard commercial real estate conditions

The LOI follows industry best practices for Seattle multifamily transactions. Would you like me to customize any specific terms or conditions?`;
  }
  
  // Offering memorandum
  if (msg.includes('offering') || msg.includes('memorandum') || msg.includes('om') || msg.includes('abstract')) {
    return `I've created a professional Offering Memorandum with the following sections:

**Executive Summary** - Investment highlights and opportunity overview
**Property Analysis** - Detailed property characteristics and specifications  
**Market Analysis** - Seattle submarket trends and comparable transactions
**Financial Performance** - Historical and projected income statements
**Investment Highlights** - Key value drivers and risk factors

The OM is formatted for institutional presentation standards. Ready for distribution to qualified investors.`;
  }
  
  // Market analysis requests
  if (msg.includes('market') || msg.includes('trends') || msg.includes('comparable') || msg.includes('comps')) {
    return `**Seattle Multifamily Market Update:**

**Current Conditions:**
• Average cap rates: 4.2-5.8% across submarkets
• Rental growth: 4.1% year-over-year
• Vacancy rates: 3.2% (historically low)
• Price per unit: $225K-$380K depending on location

**Market Drivers:**
• Continued tech sector expansion
• Limited new construction pipeline
• Strong in-migration trends
• Infrastructure investments supporting growth

The market fundamentals remain robust for quality multifamily assets. What specific submarket would you like me to analyze further?`;
  }
  
  // Default intelligent response
  return `I'm RETS AI, your commercial real estate intelligence assistant. I can help you with:

**Property Analysis:**
• Deal sourcing and screening
• Comparative market analysis
• Financial underwriting

**Document Generation:**
• Offering memoranda
• Letters of intent  
• Financial models (Excel format)

**Market Intelligence:**
• Seattle submarket analysis
• Comparable transactions
• Investment recommendations

What specific aspect of your commercial real estate transaction can I assist with today?`;
}

export async function GET() {
  return NextResponse.json({
    message: 'RETS AI Chat API is running',
    status: 'healthy'
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}