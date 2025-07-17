import { NextRequest, NextResponse } from 'next/server';

interface ExcelModelData {
  property: any;
  financialModel: any;
  projections: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { property, financialModel, projections } = await request.json();
    
    if (!property || !financialModel) {
      return NextResponse.json(
        { error: 'Property and financial model data required' },
        { status: 400 }
      );
    }

    // Generate Excel-like data structure that can be used with various Excel libraries
    const excelData = generateExcelModel(property, financialModel, projections);
    
    return NextResponse.json({
      success: true,
      data: excelData,
      downloadUrl: `/api/excel-model/download?property=${encodeURIComponent(property.address)}`,
      message: 'Financial model generated successfully'
    });

  } catch (error) {
    console.error('Excel model generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateExcelModel(property: any, model: any, projections: any[]) {
  const purchasePrice = parseInt(property.price.replace(/[$,]/g, ''));
  
  return {
    metadata: {
      propertyAddress: property.address,
      generatedDate: new Date().toISOString(),
      analysisType: 'Commercial Real Estate Financial Model'
    },
    
    // Property Summary Sheet
    propertySummary: {
      address: property.address,
      city: property.location.split(',')[0],
      state: 'WA',
      propertyType: 'Multifamily',
      totalUnits: extractUnits(property.details),
      purchasePrice: purchasePrice,
      capRate: parseFloat(property.capRate),
      pricePerUnit: Math.round(purchasePrice / extractUnits(property.details))
    },
    
    // Acquisition Analysis
    acquisitionAnalysis: {
      purchasePrice: purchasePrice,
      closingCosts: Math.round(purchasePrice * 0.025),
      totalInvestment: Math.round(purchasePrice * 1.025),
      downPayment: Math.round(purchasePrice * 0.25),
      loanAmount: Math.round(purchasePrice * 0.75),
      loanToValue: 75.0,
      interestRate: 7.5,
      amortization: 25,
      debtService: model.loanAmount * 0.08
    },
    
    // Operating Income Statement
    operatingStatement: {
      grossScheduledIncome: model.grossIncome,
      vacancy: Math.round(model.grossIncome * 0.05),
      effectiveGrossIncome: Math.round(model.grossIncome * 0.95),
      operatingExpenses: model.expenses,
      netOperatingIncome: model.noi,
      debtService: Math.round(model.loanAmount * 0.08),
      cashFlow: model.noi - Math.round(model.loanAmount * 0.08)
    },
    
    // 10-Year Projections
    projections: projections.map((proj, index) => ({
      year: proj.year,
      grossIncome: proj.income,
      vacancy: Math.round(proj.income * 0.05),
      effectiveIncome: Math.round(proj.income * 0.95),
      operatingExpenses: proj.expenses,
      noi: proj.noi,
      debtService: Math.round(model.loanAmount * 0.08),
      cashFlow: proj.cashFlow,
      cumulativeCashFlow: projections.slice(0, index + 1).reduce((sum, p) => sum + p.cashFlow, 0)
    })),
    
    // Return Analysis
    returnAnalysis: {
      capRate: model.capRate,
      cashOnCash: model.cashOnCash,
      totalReturn: model.totalReturn,
      irr: model.irr,
      equityMultiple: calculateEquityMultiple(model, projections),
      averageAnnualReturn: model.irr
    },
    
    // Sensitivity Analysis
    sensitivityAnalysis: generateSensitivityData(model),
    
    // Unit Mix Analysis
    unitMix: generateUnitMixData(extractUnits(property.details)),
    
    // Market Comparables
    comparables: model.marketComps || []
  };
}

function extractUnits(details: string): number {
  const match = details.match(/(\d+)-unit/);
  return match ? parseInt(match[1]) : 25;
}

function calculateEquityMultiple(model: any, projections: any[]): number {
  const totalCashFlow = projections.reduce((sum, proj) => sum + proj.cashFlow, 0);
  const initialEquity = model.downPayment;
  const appreciation = model.purchasePrice * 0.25; // Assume 25% appreciation over 10 years
  
  return (totalCashFlow + appreciation) / initialEquity;
}

function generateSensitivityData(model: any) {
  const baseNOI = model.noi;
  const basePrice = model.purchasePrice;
  
  return {
    exitCapRates: [4.0, 4.5, 5.0, 5.5, 6.0],
    noiVariations: [-10, -5, 0, 5, 10],
    scenarios: [
      { scenario: 'Conservative', noiGrowth: 2.0, exitCap: 5.5, irr: 8.5 },
      { scenario: 'Base Case', noiGrowth: 3.0, exitCap: 5.0, irr: 12.2 },
      { scenario: 'Optimistic', noiGrowth: 4.0, exitCap: 4.5, irr: 16.8 }
    ]
  };
}

function generateUnitMixData(totalUnits: number) {
  const studio = Math.floor(totalUnits * 0.15);
  const oneBed = Math.floor(totalUnits * 0.45);
  const twoBed = Math.floor(totalUnits * 0.35);
  const threeBed = totalUnits - studio - oneBed - twoBed;
  
  return [
    { unitType: 'Studio', count: studio, avgSF: 550, currentRent: 1850, marketRent: 1950, annualIncome: studio * 1850 * 12 },
    { unitType: '1BR', count: oneBed, avgSF: 750, currentRent: 2400, marketRent: 2550, annualIncome: oneBed * 2400 * 12 },
    { unitType: '2BR', count: twoBed, avgSF: 1100, currentRent: 3200, marketRent: 3400, annualIncome: twoBed * 3200 * 12 },
    { unitType: '3BR', count: threeBed, avgSF: 1350, currentRent: 4100, marketRent: 4350, annualIncome: threeBed * 4100 * 12 }
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyAddress = searchParams.get('property');
  
  if (!propertyAddress) {
    return NextResponse.json({ error: 'Property address required' }, { status: 400 });
  }
  
  // In a real implementation, this would generate and return an actual Excel file
  // For now, return a download link placeholder
  return NextResponse.json({
    message: 'Excel file generation would be implemented here',
    filename: `${propertyAddress.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Model.xlsx`,
    note: 'This would trigger a file download in the production system'
  });
}