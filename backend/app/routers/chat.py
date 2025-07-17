from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging

from models.chat import ChatRequest, ChatResponse, ChatAction
from models.property import PropertySearchFilters
from services.openai_service import OpenAIService
from services.property_service import PropertyService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
def get_openai_service() -> OpenAIService:
    return OpenAIService()

def get_property_service() -> PropertyService:
    return PropertyService()

@router.post("/", response_model=Dict[str, Any])
async def process_chat_message(
    request: ChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service),
    property_service: PropertyService = Depends(get_property_service)
):
    """Process chat message and return appropriate response with actions."""
    
    try:
        logger.info(f"Processing chat message: {request.message[:100]}...")
        
        # Process message with OpenAI
        ai_result = await openai_service.process_message(
            request.message, 
            request.conversation_history
        )
        
        # Handle different actions
        response_data = {
            "message": ai_result.message,
            "action": ai_result.action.value
        }
        
        if ai_result.action == ChatAction.SEARCH_PROPERTIES:
            # Extract additional filters from the message
            additional_filters = openai_service.parse_search_query(request.message)
            
            # Combine AI extracted filters with parsed filters
            combined_filters = {}
            if ai_result.extracted_filters:
                combined_filters.update(ai_result.extracted_filters)
            combined_filters.update(additional_filters)
            
            # Create PropertySearchFilters object
            search_filters = PropertySearchFilters(**combined_filters)
            
            # Search for properties
            search_result = await property_service.search_properties(
                request.message, 
                search_filters
            )
            
            response_data["data"] = search_result.dict()
            response_data["searchFilters"] = combined_filters
            
        elif ai_result.action == ChatAction.GENERATE_UNDERWRITING:
            response_data["data"] = {"propertyId": ai_result.property_id}
            response_data["propertyId"] = ai_result.property_id
            
        elif ai_result.action == ChatAction.GENERATE_LOI:
            response_data["data"] = {"propertyId": ai_result.property_id}
            response_data["propertyId"] = ai_result.property_id
        
        return response_data
        
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat message"
        )

@router.get("/health")
async def chat_health():
    """Chat service health check."""
    return {"status": "healthy", "service": "chat"}

@router.post("/test")
async def test_chat(
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """Test endpoint for chat functionality."""
    
    try:
        test_message = "Find me properties in Seattle under $5M"
        result = await openai_service.process_message(test_message)
        
        return {
            "test_message": test_message,
            "result": {
                "message": result.message,
                "action": result.action.value,
                "confidence": result.confidence
            }
        }
    except Exception as e:
        logger.error(f"Chat test error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat test failed: {str(e)}"
        )