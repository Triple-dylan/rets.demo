import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Mock OpenAI response for demo purposes
    // In production, you would use the actual OpenAI API here
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';
    
    let mockResponse = '';
    
    if (userMessage.toLowerCase().includes('find') || userMessage.toLowerCase().includes('properties') || userMessage.toLowerCase().includes('seattle')) {
      mockResponse = 'I have completed the deal sourcing task and I\'m happy to assist with it. Is there anything else you need help with?';
    } else if (userMessage.toLowerCase().includes('underwriting')) {
      mockResponse = 'The underwriting analysis task is complete. I\'m happy to assist with this. Is there anything else you need help with?';
    } else if (userMessage.toLowerCase().includes('loi')) {
      mockResponse = 'I\'m happy to have helped with the LOI generation. Is there anything else you need assistance with?';
    } else {
      mockResponse = 'I\'m RETS AI, your real estate assistant. I can help you find properties, generate underwriting analysis, and create LOI documents. What would you like me to help you with?';
    }

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      message: mockResponse,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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