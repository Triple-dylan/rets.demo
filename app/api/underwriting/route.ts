import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Property {
  id: number;
  address: string;
  location: string;
  price: string;
  details: string;
  capRate: string;
  units?: number;
  squareFootage?: number;
  yearBuilt?: number;
}

interface FinancialModel {
  property: Property;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  grossIncome: number;
  expenses: number;
  noi: number;
  capRate: number;
  cashOnCash: number;
  totalReturn: number;
  irr: number;
  projections: Array<{
    year: number;
    income: number;
    expenses: number;
    noi: number;
    cashFlow: number;
  }>;
  analysis: string;
  marketComps: Array<{
    address: string;
    price: string;
    capRate: string;
    pricePerUnit: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { property, analysisType = 'full' } = await request.json();
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    // Extract property details
    const purchasePrice = parseInt(property.price.replace(/[$,]/g, ''));
    const capRate = parseFloat(property.capRate);
    const units = extractUnits(property.details);
    
    // Calculate base financials
    const noi = Math.round(purchasePrice * (capRate / 100));
    const grossIncome = Math.round(noi / 0.85); // Assuming 85% NOI ratio
    const expenses = grossIncome - noi;
    
    // Loan assumptions (typical CRE)
    const downPayment = Math.round(purchasePrice * 0.25); // 25% down
    const loanAmount = purchasePrice - downPayment;
    const interestRate = 7.5; // Current market rate
    const annualDebtService = Math.round(loanAmount * 0.08); // Approximate
    const cashFlow = noi - annualDebtService;
    const cashOnCash = cashFlow / downPayment;
    
    // Generate AI analysis
    const analysisPrompt = `
      Analyze this commercial real estate investment:
      
      Property: ${property.address}, ${property.location}
      Purchase Price: ${property.price}
      Cap Rate: ${property.capRate}
      Units: ${units}
      Property Type: ${property.details}
      
      Financial Metrics:
      - NOI: $${noi.toLocaleString()}
      - Gross Income: $${grossIncome.toLocaleString()}
      - Cash Flow: $${cashFlow.toLocaleString()}
      - Cash-on-Cash Return: ${(cashOnCash * 100).toFixed(2)}%
      
      Provide a comprehensive analysis covering:
      1. Investment strengths and weaknesses
      2. Market position assessment
      3. Risk factors
      4. Growth potential
      5. Recommendation (Buy/Hold/Pass)
      
      Format as professional real estate analysis, 200-300 words.
    `;

    let aiAnalysis = '';
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a commercial real estate analyst with 15+ years experience. Provide professional, data-driven analysis."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        
        aiAnalysis = completion.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.log('OpenAI API not configured, using mock analysis');
    }
    
    // Fallback analysis if OpenAI is not available
    if (!aiAnalysis) {
      aiAnalysis = generateMockAnalysis(property, cashOnCash, capRate);
    }
    
    // Generate 10-year projections
    const projections = generateProjections(grossIncome, expenses, noi);
    
    // Generate market comparables
    const marketComps = generateMarketComps(property);
    
    // Calculate IRR (simplified)
    const irr = calculateIRR(cashFlow, purchasePrice, 10);
    
    const financialModel: FinancialModel = {
      property,
      purchasePrice,
      downPayment,
      loanAmount,
      interestRate,
      grossIncome,
      expenses,
      noi,
      capRate: capRate,
      cashOnCash,
      totalReturn: capRate + (cashOnCash * 100),
      irr,
      projections,
      analysis: aiAnalysis,
      marketComps
    };

    return NextResponse.json(financialModel);

  } catch (error) {
    console.error('Underwriting API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractUnits(details: string): number {
  const match = details.match(/(\d+)-unit/);
  return match ? parseInt(match[1]) : 20; // Default
}

function generateMockAnalysis(property: any, cashOnCash: number, capRate: number): string {
  const recommendation = capRate > 5 && cashOnCash > 0.08 ? 'STRONG BUY' : 
                        capRate > 4 && cashOnCash > 0.05 ? 'BUY' : 'HOLD';
  
  return `**Investment Analysis - ${property.address}**

**Strengths:**
• Solid ${capRate}% cap rate in the Seattle market
• ${cashOnCash > 0.08 ? 'Strong' : 'Moderate'} cash-on-cash returns at ${(cashOnCash * 100).toFixed(1)}%
• Multifamily asset class provides stable income streams
• Seattle market fundamentals remain strong with tech sector growth

**Risk Factors:**
• Interest rate sensitivity with current borrowing costs
• Market saturation in certain Seattle submarkets
• Potential regulatory changes affecting rental properties

**Market Position:**
This property is positioned ${capRate > 5 ? 'favorably' : 'competitively'} within the Seattle multifamily market. The asset demonstrates ${cashOnCash > 0.06 ? 'attractive' : 'moderate'} yield characteristics for institutional-quality real estate.

**Recommendation:** ${recommendation}
Target acquisition with ${recommendation === 'STRONG BUY' ? 'immediate action' : 'standard due diligence timeline'}.`;
}

function generateProjections(baseIncome: number, baseExpenses: number, baseNOI: number) {
  const projections = [];
  let income = baseIncome;
  let expenses = baseExpenses;
  
  for (let year = 1; year <= 10; year++) {
    income *= 1.03; // 3% annual growth
    expenses *= 1.025; // 2.5% annual expense growth
    const noi = income - expenses;
    const cashFlow = noi - (baseNOI * 0.5); // Simplified debt service
    
    projections.push({
      year,
      income: Math.round(income),
      expenses: Math.round(expenses),
      noi: Math.round(noi),
      cashFlow: Math.round(cashFlow)
    });
  }
  
  return projections;
}

function generateMarketComps(property: any) {
  const basePrice = parseInt(property.price.replace(/[$,]/g, ''));
  
  return [
    {
      address: "1420 E Pine St, Seattle, WA",
      price: `$${(basePrice * 1.1).toLocaleString()}`,
      capRate: "4.8%",
      pricePerUnit: `$${Math.round(basePrice * 1.1 / 25).toLocaleString()}`
    },
    {
      address: "950 Taylor Ave N, Seattle, WA",
      price: `$${(basePrice * 0.95).toLocaleString()}`,
      capRate: "5.2%",
      pricePerUnit: `$${Math.round(basePrice * 0.95 / 22).toLocaleString()}`
    },
    {
      address: "2200 Westlake Ave, Seattle, WA",
      price: `$${(basePrice * 1.05).toLocaleString()}`,
      capRate: "4.9%",
      pricePerUnit: `$${Math.round(basePrice * 1.05 / 28).toLocaleString()}`
    }
  ];
}

function calculateIRR(annualCashFlow: number, initialInvestment: number, years: number): number {
  // Simplified IRR calculation
  const totalCashFlow = annualCashFlow * years;
  const appreciation = initialInvestment * 0.3; // Assume 30% appreciation
  const totalReturn = totalCashFlow + appreciation;
  
  return ((Math.pow(totalReturn / initialInvestment, 1/years) - 1) * 100);
}