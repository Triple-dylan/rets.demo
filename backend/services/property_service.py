import asyncio
from typing import List, Optional
from models.property import Property, PropertySearchFilters, PropertySearchResult
from data.mock_properties import MOCK_PROPERTIES
import logging

logger = logging.getLogger(__name__)

class PropertyService:
    def __init__(self):
        self.properties = MOCK_PROPERTIES
    
    async def search_properties(
        self, 
        query: str, 
        filters: Optional[PropertySearchFilters] = None
    ) -> PropertySearchResult:
        """Search properties based on query and filters."""
        
        # Simulate API delay
        await asyncio.sleep(1)
        
        filtered_properties = self.properties.copy()
        
        if filters:
            filtered_properties = self._apply_filters(filtered_properties, filters)
        
        # Apply natural language query filtering
        filtered_properties = self._apply_query_filters(filtered_properties, query)
        
        return PropertySearchResult(
            properties=filtered_properties,
            totalCount=len(filtered_properties),
            searchQuery=query
        )
    
    async def get_property_by_id(self, property_id: str) -> Optional[Property]:
        """Get a specific property by ID."""
        await asyncio.sleep(0.5)  # Simulate API delay
        
        for property in self.properties:
            if property.id == property_id:
                return property
        return None
    
    def _apply_filters(self, properties: List[Property], filters: PropertySearchFilters) -> List[Property]:
        """Apply search filters to property list."""
        
        # Location filter
        if filters.location:
            location_lower = filters.location.lower()
            properties = [
                prop for prop in properties
                if (location_lower in prop.city.lower() or 
                    location_lower in prop.address.lower() or
                    location_lower in prop.state.lower())
            ]
        
        # Price filters
        if filters.min_price is not None:
            properties = [prop for prop in properties if prop.price >= filters.min_price]
        
        if filters.max_price is not None:
            properties = [prop for prop in properties if prop.price <= filters.max_price]
        
        # Cap rate filters
        if filters.min_cap_rate is not None:
            properties = [prop for prop in properties if prop.cap_rate >= filters.min_cap_rate]
        
        if filters.max_cap_rate is not None:
            properties = [prop for prop in properties if prop.cap_rate <= filters.max_cap_rate]
        
        # Unit count filters
        if filters.min_units is not None:
            properties = [prop for prop in properties if prop.units >= filters.min_units]
        
        if filters.max_units is not None:
            properties = [prop for prop in properties if prop.units <= filters.max_units]
        
        # Property type filter
        if filters.property_type is not None:
            properties = [prop for prop in properties if prop.property_type == filters.property_type]
        
        return properties
    
    def _apply_query_filters(self, properties: List[Property], query: str) -> List[Property]:
        """Apply additional filtering based on natural language query."""
        query_lower = query.lower()
        
        # Extract and apply price range from query
        import re
        
        price_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?[-\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?', query_lower)
        if price_match:
            min_price = self._parse_price(price_match.group(1))
            max_price = self._parse_price(price_match.group(2))
            properties = [
                prop for prop in properties 
                if min_price <= prop.price <= max_price
            ]
        
        # Extract and apply cap rate from query
        cap_rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%?\s*[-\s]*(\d+(?:\.\d+)?)\s*%?\s*cap\s*rate', query_lower)
        if cap_rate_match:
            min_cap_rate = float(cap_rate_match.group(1))
            max_cap_rate = float(cap_rate_match.group(2))
            properties = [
                prop for prop in properties 
                if min_cap_rate <= prop.cap_rate <= max_cap_rate
            ]
        
        return properties
    
    def _parse_price(self, price_str: str) -> float:
        """Parse price string and convert to float."""
        price = float(price_str.replace(',', ''))
        
        if 'm' in price_str.lower():
            price *= 1_000_000
        elif 'k' in price_str.lower():
            price *= 1_000
            
        return price
    
    def parse_search_query(self, query: str) -> PropertySearchFilters:
        """Parse natural language query into search filters."""
        filters_dict = {}
        query_lower = query.lower()
        
        # Extract location
        location_words = ['in', 'near', 'around']
        for word in location_words:
            if word in query_lower:
                parts = query_lower.split(word)
                if len(parts) > 1:
                    # Try to extract the location after the keyword
                    location_part = parts[1].strip().split()[0] if parts[1].strip() else None
                    if location_part and location_part not in ['seattle', 'bellevue', 'tacoma']:
                        # If it's not a known city, use the word itself
                        location_part = word if word in ['seattle', 'bellevue', 'tacoma'] else location_part
                    filters_dict['location'] = location_part
                    break
        
        # Check for specific cities mentioned
        cities = ['seattle', 'bellevue', 'tacoma', 'portland']
        for city in cities:
            if city in query_lower:
                filters_dict['location'] = city
                break
        
        return PropertySearchFilters(**filters_dict)