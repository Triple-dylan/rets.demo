from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    UNDERWRITING = "underwriting"
    LOI = "loi"

class OperatingExpenses(BaseModel):
    management: float
    maintenance: float
    insurance: float
    taxes: float
    utilities: float
    other: float

class UnderwritingCalculations(BaseModel):
    gross_rental_income: float = Field(..., alias="grossRentalIncome")
    net_operating_income: float = Field(..., alias="netOperatingIncome")
    cap_rate: float = Field(..., alias="capRate")
    cash_on_cash_return: float = Field(..., alias="cashOnCashReturn")
    debt_service_coverage: float = Field(..., alias="debtServiceCoverage")
    monthly_debt_service: float = Field(..., alias="monthlyDebtService")
    monthly_cash_flow: float = Field(..., alias="monthlyCashFlow")
    annual_cash_flow: float = Field(..., alias="annualCashFlow")

    class Config:
        allow_population_by_field_name = True

class UnderwritingAnalysis(BaseModel):
    property_id: str = Field(..., alias="propertyId")
    property_address: str = Field(..., alias="propertyAddress")
    analysis_date: datetime = Field(..., alias="analysisDate")
    purchase_price: float = Field(..., alias="purchasePrice")
    down_payment: float = Field(..., alias="downPayment")
    loan_amount: float = Field(..., alias="loanAmount")
    interest_rate: float = Field(..., alias="interestRate")
    loan_term: int = Field(..., alias="loanTerm")
    monthly_rent: float = Field(..., alias="monthlyRent")
    vacancy: float
    operating_expenses: OperatingExpenses = Field(..., alias="operatingExpenses")
    calculations: UnderwritingCalculations

    class Config:
        allow_population_by_field_name = True

class LOIDetails(BaseModel):
    property_address: str = Field(..., alias="propertyAddress")
    offer_price: float = Field(..., alias="offerPrice")
    earnest_money: float = Field(..., alias="earnestMoney")
    closing_date: datetime = Field(..., alias="closingDate")
    inspection_period: int = Field(..., alias="inspectionPeriod")
    financing_contingency: bool = Field(..., alias="financingContingency")
    additional_terms: List[str] = Field(..., alias="additionalTerms")
    buyer_name: str = Field(..., alias="buyerName")
    buyer_contact: str = Field(..., alias="buyerContact")

    class Config:
        allow_population_by_field_name = True

class DocumentGenerationRequest(BaseModel):
    type: DocumentType
    property_id: str = Field(..., alias="propertyId")
    offer_price: Optional[float] = Field(None, alias="offerPrice")
    additional_data: Optional[Dict] = Field(None, alias="additionalData")

    class Config:
        allow_population_by_field_name = True