from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from models.property import Property, PropertySearchFilters, PropertySearchResult
from services.property_service import PropertyService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
def get_property_service() -> PropertyService:
    return PropertyService()

@router.get("/search", response_model=PropertySearchResult)
async def search_properties(
    query: str = Query(..., description="Search query"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    location: Optional[str] = Query(None, description="Location filter"),
    min_cap_rate: Optional[float] = Query(None, description="Minimum cap rate filter"),
    max_cap_rate: Optional[float] = Query(None, description="Maximum cap rate filter"),
    property_type: Optional[str] = Query(None, description="Property type filter"),
    min_units: Optional[int] = Query(None, description="Minimum units filter"),
    max_units: Optional[int] = Query(None, description="Maximum units filter"),
    property_service: PropertyService = Depends(get_property_service)
):
    """Search properties with filters."""
    
    try:
        logger.info(f"Searching properties with query: {query}")
        
        # Create filters object
        filters = PropertySearchFilters(
            minPrice=min_price,
            maxPrice=max_price,
            location=location,
            minCapRate=min_cap_rate,
            maxCapRate=max_cap_rate,
            propertyType=property_type,
            minUnits=min_units,
            maxUnits=max_units
        )
        
        # Search properties
        result = await property_service.search_properties(query, filters)
        
        logger.info(f"Found {result.total_count} properties")
        return result
        
    except Exception as e:
        logger.error(f"Property search error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to search properties"
        )

@router.get("/", response_model=List[Property])
async def get_all_properties(
    property_service: PropertyService = Depends(get_property_service)
):
    """Get all available properties."""
    
    try:
        # Return all properties (mock data)
        result = await property_service.search_properties("", None)
        return result.properties
        
    except Exception as e:
        logger.error(f"Get all properties error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get properties"
        )

@router.get("/{property_id}", response_model=Property)
async def get_property_by_id(
    property_id: str,
    property_service: PropertyService = Depends(get_property_service)
):
    """Get a specific property by ID."""
    
    try:
        logger.info(f"Getting property: {property_id}")
        
        property = await property_service.get_property_by_id(property_id)
        
        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found"
            )
        
        return property
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get property error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get property"
        )

@router.get("/health")
async def properties_health():
    """Properties service health check."""
    return {"status": "healthy", "service": "properties"}

@router.post("/test")
async def test_property_search(
    property_service: PropertyService = Depends(get_property_service)
):
    """Test endpoint for property search."""
    
    try:
        # Test search
        test_query = "apartments in Seattle"
        result = await property_service.search_properties(test_query)
        
        return {
            "test_query": test_query,
            "result_count": result.total_count,
            "sample_properties": [p.dict() for p in result.properties[:2]]
        }
        
    except Exception as e:
        logger.error(f"Property test error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Property test failed: {str(e)}"
        )