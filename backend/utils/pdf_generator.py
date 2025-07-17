from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from models.property import Property
from models.document import LOIDetails

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Create custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='BodyBold',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold'
        ))
    
    def generate_loi_pdf(self, property: Property, loi_details: LOIDetails) -> BytesIO:
        """Generate Letter of Intent PDF document."""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build the document content
        story = []
        
        # Title
        title = Paragraph("LETTER OF INTENT", self.styles['CustomTitle'])
        story.append(title)
        
        subtitle = Paragraph("Real Estate Purchase", self.styles['Heading2'])
        subtitle.hAlign = 'CENTER'
        story.append(subtitle)
        story.append(Spacer(1, 0.5*inch))
        
        # Date
        date_text = f"Date: {datetime.now().strftime('%B %d, %Y')}"
        date_para = Paragraph(date_text, self.styles['Normal'])
        story.append(date_para)
        story.append(Spacer(1, 0.3*inch))
        
        # Property Information Section
        story.append(Paragraph("PROPERTY INFORMATION:", self.styles['SectionHeader']))
        
        property_info = [
            f"<b>Address:</b> {property.address}",
            f"<b>City, State, ZIP:</b> {property.city}, {property.state} {property.zip_code}",
            f"<b>Property Type:</b> {property.property_type.value.title()} ({property.units} units)",
        ]
        
        if property.year_built:
            property_info.append(f"<b>Year Built:</b> {property.year_built}")
        
        if property.square_footage:
            property_info.append(f"<b>Square Footage:</b> {property.square_footage:,} sq ft")
        
        for info in property_info:
            story.append(Paragraph(info, self.styles['Normal']))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Buyer Information Section
        story.append(Paragraph("BUYER INFORMATION:", self.styles['SectionHeader']))
        
        buyer_info = [
            f"<b>Name:</b> {loi_details.buyer_name}",
            f"<b>Contact:</b> {loi_details.buyer_contact}",
        ]
        
        for info in buyer_info:
            story.append(Paragraph(info, self.styles['Normal']))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Purchase Terms Section
        story.append(Paragraph("PURCHASE TERMS:", self.styles['SectionHeader']))
        
        purchase_terms = [
            f"<b>Offer Price:</b> {self._format_currency(loi_details.offer_price)}",
            f"<b>Earnest Money:</b> {self._format_currency(loi_details.earnest_money)}",
            f"<b>Proposed Closing Date:</b> {loi_details.closing_date.strftime('%B %d, %Y')}",
            f"<b>Inspection Period:</b> {loi_details.inspection_period} days",
            f"<b>Financing Contingency:</b> {'Yes' if loi_details.financing_contingency else 'No'}",
        ]
        
        for term in purchase_terms:
            story.append(Paragraph(term, self.styles['Normal']))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Terms and Conditions Section
        story.append(Paragraph("TERMS AND CONDITIONS:", self.styles['SectionHeader']))
        
        standard_terms = [
            "1. This Letter of Intent is non-binding and subject to execution of a formal Purchase Agreement.",
            "2. Buyer shall have the right to inspect the property during the inspection period.",
            "3. Sale is contingent upon buyer securing satisfactory financing terms.",
            "4. Property to be sold in \"as-is\" condition unless otherwise negotiated.",
            "5. Standard title insurance and warranty deed to be provided by seller.",
            "6. Prorations of taxes, insurance, and other expenses as of closing date.",
        ]
        
        # Add additional terms if provided
        all_terms = standard_terms.copy()
        if loi_details.additional_terms:
            for i, term in enumerate(loi_details.additional_terms):
                all_terms.append(f"{len(standard_terms) + i + 1}. {term}")
        
        for term in all_terms:
            story.append(Paragraph(term, self.styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        story.append(Spacer(1, 0.4*inch))
        
        # Signature Section
        story.append(Paragraph("SIGNATURES:", self.styles['SectionHeader']))
        
        # Create signature table
        signature_data = [
            ["Buyer:", "_" * 40, "Date:", "_" * 20],
            [loi_details.buyer_name, "", "", ""],
            ["", "", "", ""],
            ["Seller:", "_" * 40, "Date:", "_" * 20],
            ["", "", "", ""],
        ]
        
        signature_table = Table(signature_data, colWidths=[1*inch, 2.5*inch, 0.8*inch, 1.5*inch])
        signature_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        
        story.append(signature_table)
        story.append(Spacer(1, 0.5*inch))
        
        # Footer
        footer_style = ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        footer_text = "Generated by RETS AI - Real Estate Transaction System"
        footer = Paragraph(footer_text, footer_style)
        story.append(footer)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return buffer
    
    def _format_currency(self, amount: float) -> str:
        """Format currency for display."""
        return f"${amount:,.0f}"