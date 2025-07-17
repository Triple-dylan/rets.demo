from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
import logging
from io import BytesIO

from models.document import DocumentGenerationRequest, DocumentType
from services.document_service import DocumentService
from services.property_service import PropertyService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
def get_document_service() -> DocumentService:
    return DocumentService()

def get_property_service() -> PropertyService:
    return PropertyService()

@router.post("/generate", response_model=Dict[str, Any])
async def generate_document(
    request: DocumentGenerationRequest,
    document_service: DocumentService = Depends(get_document_service),
    property_service: PropertyService = Depends(get_property_service)
):
    """Generate document data for preview in UI."""
    
    try:
        logger.info(f"Generating {request.type} document for property {request.property_id}")
        
        # Get property details
        property = await property_service.get_property_by_id(request.property_id)
        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found"
            )
        
        # Generate document preview data
        document_data = await document_service.get_document_preview_data(
            property, 
            request.type.value
        )
        
        # Create download URL
        download_url = f"/api/documents/download?type={request.type.value}&propertyId={request.property_id}"
        if request.offer_price:
            download_url += f"&offerPrice={request.offer_price}"
        
        return {
            "success": True,
            "data": document_data,
            "downloadUrl": download_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate document"
        )

@router.get("/download")
async def download_document(
    type: str = Query(..., description="Document type (underwriting or loi)"),
    propertyId: str = Query(..., description="Property ID"),
    offerPrice: Optional[float] = Query(None, description="Offer price for LOI"),
    document_service: DocumentService = Depends(get_document_service),
    property_service: PropertyService = Depends(get_property_service)
):
    """Download generated document file."""
    
    try:
        logger.info(f"Downloading {type} document for property {propertyId}")
        
        # Validate document type
        if type not in ["underwriting", "loi"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid document type. Must be 'underwriting' or 'loi'"
            )
        
        # Get property details
        property = await property_service.get_property_by_id(propertyId)
        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found"
            )
        
        # Generate document
        if type == "underwriting":
            document_buffer, filename = await document_service.generate_underwriting_document(property)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            
        elif type == "loi":
            document_buffer, filename = await document_service.generate_loi_document(
                property, 
                offerPrice
            )
            media_type = "application/pdf"
        
        # Return file as streaming response
        return StreamingResponse(
            BytesIO(document_buffer.getvalue()),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document download error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to download document"
        )

@router.get("/health")
async def documents_health():
    """Documents service health check."""
    return {"status": "healthy", "service": "documents"}

@router.post("/test")
async def test_document_generation(
    document_service: DocumentService = Depends(get_document_service),
    property_service: PropertyService = Depends(get_property_service)
):
    """Test endpoint for document generation."""
    
    try:
        # Get a test property
        properties = await property_service.search_properties("", None)
        if not properties.properties:
            raise HTTPException(
                status_code=404,
                detail="No test properties available"
            )
        
        test_property = properties.properties[0]
        
        # Test underwriting generation
        underwriting_data = await document_service.get_document_preview_data(
            test_property, 
            "underwriting"
        )
        
        # Test LOI generation  
        loi_data = await document_service.get_document_preview_data(
            test_property,
            "loi"
        )
        
        return {
            "test_property": test_property.dict(),
            "underwriting_generated": bool(underwriting_data),
            "loi_generated": bool(loi_data),
            "underwriting_cap_rate": underwriting_data.get("analysis", {}).get("calculations", {}).get("capRate"),
            "loi_offer_price": loi_data.get("loiDetails", {}).get("offerPrice")
        }
        
    except Exception as e:
        logger.error(f"Document test error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Document test failed: {str(e)}"
        )