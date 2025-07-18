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

interface OfferingMemorandum {
  executiveSummary: string;
  propertyOverview: {
    address: string;
    propertyType: string;
    totalUnits: number;
    totalSF: number;
    yearBuilt: number;
    lotSize: string;
    zoning: string;
  };
  locationAnalysis: string;
  financialHighlights: {
    purchasePrice: string;
    capRate: string;
    noi: string;
    grossIncome: string;
    pricePerUnit: string;
    pricePerSF: string;
  };
  marketAnalysis: string;
  investmentHighlights: string[];
  riskFactors: string[];
  financialSummary: {
    currentIncome: string;
    proFormaIncome: string;
    expenses: string;
    noi: string;
    capRate: string;
  };
  unitMix: Array<{
    type: string;
    count: number;
    avgSF: number;
    currentRent: string;
    marketRent: string;
  }>;
  photos: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { property } = await request.json();
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    const purchasePrice = parseInt(property.price.replace(/[$,]/g, ''));
    const capRate = parseFloat(property.capRate);
    const units = extractUnits(property.details);
    const noi = Math.round(purchasePrice * (capRate / 100));
    const grossIncome = Math.round(noi / 0.85);
    
    // Generate AI-powered content
    const executiveSummaryPrompt = `
      Create a compelling executive summary for this commercial real estate offering memorandum:
      
      Property: ${property.address}, ${property.location}
      Price: ${property.price}
      Units: ${units}
      Cap Rate: ${property.capRate}
      Type: Multifamily apartment building
      
      Write a professional 150-word executive summary highlighting the investment opportunity, location advantages, and financial performance. Use compelling but factual language suitable for institutional investors.
    `;
    
    const locationAnalysisPrompt = `
      Provide a detailed location analysis for a commercial real estate offering memorandum:
      
      Property Location: ${property.address}, ${property.location}
      
      Cover: neighborhood characteristics, nearby amenities, transportation access, employment centers, demographics, and growth prospects. Write 200-250 words in professional tone suitable for institutional investors.
    `;
    
    const marketAnalysisPrompt = `
      Create a comprehensive market analysis for this Seattle multifamily property:
      
      Property: ${property.address}
      Units: ${units}
      Cap Rate: ${property.capRate}
      
      Include: rental market trends, supply/demand dynamics, comparable properties, rent growth projections, and market outlook. Write 250-300 words for institutional investors.
    `;

    let aiContent = {
      executiveSummary: '',
      locationAnalysis: '',
      marketAnalysis: ''
    };

    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        const [execSummary, locationAnalysis, marketAnalysis] = await Promise.all([
          openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are a commercial real estate analyst creating professional offering memoranda for institutional investors." },
              { role: "user", content: executiveSummaryPrompt }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
          openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are a commercial real estate analyst specializing in location and demographic analysis." },
              { role: "user", content: locationAnalysisPrompt }
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
          openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are a commercial real estate market analyst with expertise in multifamily properties." },
              { role: "user", content: marketAnalysisPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
          })
        ]);
        
        aiContent.executiveSummary = execSummary.choices[0]?.message?.content || '';
        aiContent.locationAnalysis = locationAnalysis.choices[0]?.message?.content || '';
        aiContent.marketAnalysis = marketAnalysis.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.log('OpenAI API not configured, using mock content');
    }
    
    // Generate fallback content if AI is not available
    if (!aiContent.executiveSummary) {
      aiContent = generateMockOMContent(property, units, capRate);
    }
    
    const offeringMemorandum: OfferingMemorandum = {
      executiveSummary: aiContent.executiveSummary,
      propertyOverview: {
        address: property.address,
        propertyType: "Multifamily Apartment Building",
        totalUnits: units,
        totalSF: units * 850, // Estimated average unit size
        yearBuilt: 1985 + Math.floor(Math.random() * 30), // Random realistic year
        lotSize: "0.75 acres",
        zoning: "Multifamily Residential"
      },
      locationAnalysis: aiContent.locationAnalysis,
      financialHighlights: {
        purchasePrice: property.price,
        capRate: property.capRate,
        noi: `$${noi.toLocaleString()}`,
        grossIncome: `$${grossIncome.toLocaleString()}`,
        pricePerUnit: `$${Math.round(purchasePrice / units).toLocaleString()}`,
        pricePerSF: `$${Math.round(purchasePrice / (units * 850)).toLocaleString()}`
      },
      marketAnalysis: aiContent.marketAnalysis,
      investmentHighlights: [
        `Strong ${property.capRate} cap rate in premium Seattle submarket`,
        `${units}-unit multifamily asset with stable income profile`,
        "Proximity to major employment centers and transportation",
        "Value-add opportunities through unit renovations",
        "Strong Seattle rental market fundamentals",
        "Professional property management in place"
      ],
      riskFactors: [
        "Interest rate sensitivity and borrowing cost fluctuations",
        "Regulatory changes affecting rental housing",
        "Market saturation in select Seattle submarkets",
        "Construction and renovation cost inflation",
        "Tenant turnover and vacancy risk"
      ],
      financialSummary: {
        currentIncome: `$${grossIncome.toLocaleString()}`,
        proFormaIncome: `$${Math.round(grossIncome * 1.08).toLocaleString()}`,
        expenses: `$${(grossIncome - noi).toLocaleString()}`,
        noi: `$${noi.toLocaleString()}`,
        capRate: property.capRate
      },
      unitMix: generateUnitMix(units),
      photos: [
        "/api/placeholder/800/600?text=Building+Exterior",
        "/api/placeholder/800/600?text=Lobby+Interior",
        "/api/placeholder/800/600?text=Unit+Layout",
        "/api/placeholder/800/600?text=Amenity+Space"
      ]
    };

    return NextResponse.json(offeringMemorandum);

  } catch (error) {
    console.error('OM generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractUnits(details: string): number {
  const match = details.match(/(\d+)-unit/);
  return match ? parseInt(match[1]) : 25;
}

function generateMockOMContent(property: any, units: number, capRate: number) {
  return {
    executiveSummary: `**Investment Opportunity - ${property.address}**

This ${units}-unit multifamily property represents a compelling investment opportunity in Seattle's dynamic rental market. The asset delivers a ${property.capRate} cap rate with strong fundamentals and upside potential through strategic improvements.

Located in a desirable Seattle submarket, the property benefits from proximity to major employment centers, excellent transportation connectivity, and robust demographic trends. The building features a diversified unit mix with stable occupancy and professional management.

With Seattle's continued population growth and limited new supply, this asset is positioned to deliver consistent cash flow and long-term appreciation for sophisticated investors seeking quality multifamily exposure in the Pacific Northwest.`,

    locationAnalysis: `**Location Analysis - ${property.location}**

${property.address} is strategically positioned in one of Seattle's most desirable residential submarkets. The location offers residents convenient access to downtown Seattle, major tech campuses, and recreational amenities.

The neighborhood features excellent walkability with local retail, dining, and services within easy reach. Public transportation options include multiple bus lines and nearby light rail connections, providing seamless access to employment centers throughout the metropolitan area.

Demographics in the area skew toward young professionals and families, with median household incomes well above city averages. The submarket has experienced consistent rental growth over the past five years, driven by job creation and limited new multifamily supply.

Recent infrastructure investments and planned developments further enhance the location's long-term prospects, positioning this asset to benefit from continued neighborhood appreciation and rental demand growth.`,

    marketAnalysis: `**Seattle Multifamily Market Analysis**

Seattle's multifamily market demonstrates exceptional fundamentals with strong rental demand driven by robust job growth, particularly in technology and healthcare sectors. Average rents have grown 4-6% annually over the past three years, outpacing national averages.

The market maintains healthy occupancy rates above 95%, with limited new supply relative to demand. Current pipeline projects are concentrated in luxury segments, creating opportunities for well-positioned workforce housing assets.

Comparable properties in the submarket trade at ${(capRate - 0.5).toFixed(1)}%-${(capRate + 0.5).toFixed(1)}% cap rates, with recent transactions demonstrating continued investor appetite for quality multifamily assets. Price per unit metrics range from $${Math.round(200000 * 0.9).toLocaleString()} to $${Math.round(200000 * 1.2).toLocaleString()} depending on asset quality and location.

Market outlook remains positive with continued in-migration, employment growth, and favorable supply-demand dynamics supporting rental growth and asset values over the investment horizon.`
  };
}

function generateUnitMix(totalUnits: number) {
  const studio = Math.floor(totalUnits * 0.15);
  const oneBed = Math.floor(totalUnits * 0.45);
  const twoBed = Math.floor(totalUnits * 0.35);
  const threeBed = totalUnits - studio - oneBed - twoBed;
  
  return [
    {
      type: "Studio",
      count: studio,
      avgSF: 550,
      currentRent: "$1,850",
      marketRent: "$1,950"
    },
    {
      type: "1 Bedroom",
      count: oneBed,
      avgSF: 750,
      currentRent: "$2,400",
      marketRent: "$2,550"
    },
    {
      type: "2 Bedroom",
      count: twoBed,
      avgSF: 1100,
      currentRent: "$3,200",
      marketRent: "$3,400"
    },
    {
      type: "3 Bedroom",
      count: threeBed,
      avgSF: 1350,
      currentRent: "$4,100",
      marketRent: "$4,350"
    }
  ];
}