export interface UnderwritingAnalysis {
  propertyId: string;
  propertyAddress: string;
  analysisDate: Date;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  vacancy: number;
  operatingExpenses: {
    management: number;
    maintenance: number;
    insurance: number;
    taxes: number;
    utilities: number;
    other: number;
  };
  calculations: {
    grossRentalIncome: number;
    netOperatingIncome: number;
    capRate: number;
    cashOnCashReturn: number;
    debtServiceCoverage: number;
    monthlyDebtService: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
  };
}

export interface LOIDetails {
  propertyAddress: string;
  offerPrice: number;
  earnestMoney: number;
  closingDate: Date;
  inspectionPeriod: number;
  financingContingency: boolean;
  additionalTerms: string[];
  buyerName: string;
  buyerContact: string;
}

export interface DocumentGenerationRequest {
  type: 'underwriting' | 'loi';
  propertyId: string;
  additionalData?: any;
}