import asyncio
from datetime import datetime, timedelta
from typing import Tuple
from io import BytesIO
from models.property import Property
from models.document import UnderwritingAnalysis, LOIDetails, OperatingExpenses, UnderwritingCalculations
from utils.excel_generator import ExcelGenerator
from utils.pdf_generator import PDFGenerator
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.excel_generator = ExcelGenerator()
        self.pdf_generator = PDFGenerator()
    
    async def generate_underwriting_analysis(self, property: Property) -> UnderwritingAnalysis:
        """Generate realistic underwriting analysis based on property data."""
        
        # Simulate processing time
        await asyncio.sleep(2)
        
        # Calculate realistic financial metrics
        purchase_price = property.price
        down_payment_percentage = 0.25  # 25% down payment
        down_payment = purchase_price * down_payment_percentage
        loan_amount = purchase_price - down_payment
        interest_rate = 6.5  # 6.5% interest rate
        loan_term = 30  # 30-year loan
        
        # Estimate monthly rent using 1% rule (adjustable based on market)
        monthly_rent = purchase_price * 0.01
        annual_rent = monthly_rent * 12
        vacancy = 5.0  # 5% vacancy rate
        effective_gross_income = annual_rent * (1 - vacancy / 100)
        
        # Calculate operating expenses (typically 40-50% of gross income)
        operating_expenses = OperatingExpenses(
            management=effective_gross_income * 0.08,  # 8% management fee
            maintenance=effective_gross_income * 0.12,  # 12% maintenance
            insurance=effective_gross_income * 0.06,   # 6% insurance  
            taxes=effective_gross_income * 0.15,       # 15% property taxes
            utilities=effective_gross_income * 0.05,   # 5% utilities
            other=effective_gross_income * 0.04        # 4% other expenses
        )
        
        total_operating_expenses = (
            operating_expenses.management +
            operating_expenses.maintenance +
            operating_expenses.insurance +
            operating_expenses.taxes +
            operating_expenses.utilities +
            operating_expenses.other
        )
        
        net_operating_income = effective_gross_income - total_operating_expenses
        
        # Calculate debt service
        monthly_rate = interest_rate / 100 / 12
        number_of_payments = loan_term * 12
        monthly_debt_service = loan_amount * (
            monthly_rate * (1 + monthly_rate) ** number_of_payments
        ) / ((1 + monthly_rate) ** number_of_payments - 1)
        
        annual_debt_service = monthly_debt_service * 12
        
        # Calculate returns and cash flow
        annual_cash_flow = net_operating_income - annual_debt_service
        monthly_cash_flow = annual_cash_flow / 12
        cap_rate = (net_operating_income / purchase_price) * 100
        cash_on_cash_return = (annual_cash_flow / down_payment) * 100
        debt_service_coverage = net_operating_income / annual_debt_service
        
        calculations = UnderwritingCalculations(
            grossRentalIncome=annual_rent,
            netOperatingIncome=net_operating_income,
            capRate=cap_rate,
            cashOnCashReturn=cash_on_cash_return,
            debtServiceCoverage=debt_service_coverage,
            monthlyDebtService=monthly_debt_service,
            monthlyCashFlow=monthly_cash_flow,
            annualCashFlow=annual_cash_flow
        )
        
        return UnderwritingAnalysis(
            propertyId=property.id,
            propertyAddress=property.address,
            analysisDate=datetime.now(),
            purchasePrice=purchase_price,
            downPayment=down_payment,
            loanAmount=loan_amount,
            interestRate=interest_rate,
            loanTerm=loan_term,
            monthlyRent=monthly_rent,
            vacancy=vacancy,
            operatingExpenses=operating_expenses,
            calculations=calculations
        )
    
    async def generate_loi_details(
        self, 
        property: Property, 
        offer_price: float = None
    ) -> LOIDetails:
        """Generate realistic LOI details."""
        
        # Simulate processing time
        await asyncio.sleep(1)
        
        # Calculate offer details
        base_offer_price = offer_price or property.price * 0.95  # 5% below asking
        earnest_money = base_offer_price * 0.01  # 1% earnest money
        closing_date = datetime.now() + timedelta(days=45)  # 45 days from today
        
        return LOIDetails(
            propertyAddress=f"{property.address}, {property.city}, {property.state} {property.zip_code}",
            offerPrice=base_offer_price,
            earnestMoney=earnest_money,
            closingDate=closing_date,
            inspectionPeriod=14,  # 14 days
            financingContingency=True,
            additionalTerms=[
                "Seller to provide all property maintenance records",
                "Current tenant leases to transfer to buyer at closing",
                "Property management transition period of 30 days included",
            ],
            buyerName="Investment Group LLC",
            buyerContact="contact@investmentgroup.com"
        )
    
    async def generate_underwriting_document(
        self, 
        property: Property
    ) -> Tuple[BytesIO, str]:
        """Generate underwriting Excel document."""
        
        logger.info(f"Generating underwriting document for property {property.id}")
        
        # Generate analysis
        analysis = await self.generate_underwriting_analysis(property)
        
        # Generate Excel file
        excel_buffer = self.excel_generator.generate_underwriting_excel(property, analysis)
        
        # Create filename
        safe_address = property.address.replace(" ", "_").replace(",", "").replace("/", "_")
        filename = f"Underwriting_{safe_address}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        
        return excel_buffer, filename
    
    async def generate_loi_document(
        self, 
        property: Property, 
        offer_price: float = None
    ) -> Tuple[BytesIO, str]:
        """Generate LOI PDF document."""
        
        logger.info(f"Generating LOI document for property {property.id}")
        
        # Generate LOI details
        loi_details = await self.generate_loi_details(property, offer_price)
        
        # Generate PDF file
        pdf_buffer = self.pdf_generator.generate_loi_pdf(property, loi_details)
        
        # Create filename
        safe_address = property.address.replace(" ", "_").replace(",", "").replace("/", "_")
        filename = f"LOI_{safe_address}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return pdf_buffer, filename
    
    async def get_document_preview_data(
        self, 
        property: Property, 
        document_type: str
    ) -> dict:
        """Get data for document preview in the UI."""
        
        if document_type == "underwriting":
            analysis = await self.generate_underwriting_analysis(property)
            
            # Generate chart data for UI display
            chart_data = self._generate_chart_data(analysis)
            
            return {
                "property": property.dict(),
                "analysis": analysis.dict(),
                "chartData": chart_data
            }
            
        elif document_type == "loi":
            loi_details = await self.generate_loi_details(property)
            
            return {
                "property": property.dict(),
                "loiDetails": loi_details.dict()
            }
        
        else:
            raise ValueError(f"Invalid document type: {document_type}")
    
    def _generate_chart_data(self, analysis: UnderwritingAnalysis) -> dict:
        """Generate chart data for UI visualization."""
        
        # 10-year cash flow projection
        cash_flow_labels = [f"Year {i+1}" for i in range(10)]
        cash_flow_data = []
        
        base_cash_flow = analysis.calculations.annual_cash_flow
        growth_rate = 0.03  # 3% annual growth
        
        for year in range(10):
            projected_cf = base_cash_flow * (1 + growth_rate) ** year
            cash_flow_data.append(round(projected_cf))
        
        # Operating expenses breakdown
        expenses_labels = ["Management", "Maintenance", "Insurance", "Taxes", "Utilities", "Other"]
        expenses_data = [
            analysis.operating_expenses.management,
            analysis.operating_expenses.maintenance,
            analysis.operating_expenses.insurance,
            analysis.operating_expenses.taxes,
            analysis.operating_expenses.utilities,
            analysis.operating_expenses.other
        ]
        
        return {
            "cashFlow": {
                "labels": cash_flow_labels,
                "data": cash_flow_data
            },
            "expenses": {
                "labels": expenses_labels,
                "data": expenses_data
            }
        }