import json
import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from models.chat import ChatResponse, ChatAction, AIProcessingResult
from models.property import PropertySearchFilters
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
    async def process_message(
        self, 
        user_message: str, 
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> AIProcessingResult:
        """Process user message with OpenAI and determine action and extract data."""
        
        try:
            system_prompt = self._get_system_prompt()
            
            messages = [{"role": "system", "content": system_prompt}]
            
            if conversation_history:
                messages.extend(conversation_history)
                
            messages.append({"role": "user", "content": user_message})
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                functions=[self._get_function_schema()],
                function_call="auto"
            )
            
            message = response.choices[0].message
            
            # Check if function was called
            if message.function_call:
                function_result = json.loads(message.function_call.arguments)
                return self._parse_function_result(function_result, message.content or "")
            
            # Fallback to content parsing
            return self._parse_content_response(message.content or "")
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return AIProcessingResult(
                message="I'm sorry, I'm having trouble processing your request right now. Please try again.",
                action=ChatAction.GENERAL_RESPONSE
            )
    
    def _get_system_prompt(self) -> str:
        return """You are RETS, an AI assistant specializing in real estate investment analysis. You help users find properties and generate investment documents.

Your capabilities:
1. Search for properties based on natural language queries
2. Generate underwriting analysis (Excel format) 
3. Generate Letters of Intent (PDF format)
4. Provide real estate investment advice

When a user asks to find properties, use the search_properties function.
When asked to generate underwriting for a property, use the generate_underwriting function.
When asked to generate an LOI, use the generate_loi function.

Extract search criteria from natural language queries:
- Location (city, neighborhood, state)
- Price range ($X-$Y, under $X, over $X) 
- Cap rate range (X%-Y% cap rate)
- Property type (apartment, office, retail, etc.)
- Unit count

Always be helpful and professional. Confirm what you're doing before taking action."""

    def _get_function_schema(self) -> Dict[str, Any]:
        return {
            "name": "process_real_estate_request",
            "description": "Process real estate requests for property search or document generation",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["search_properties", "generate_underwriting", "generate_loi", "general_response"],
                        "description": "The action to take based on user request"
                    },
                    "message": {
                        "type": "string",
                        "description": "Response message to the user"
                    },
                    "search_filters": {
                        "type": "object",
                        "properties": {
                            "min_price": {"type": "number"},
                            "max_price": {"type": "number"},
                            "location": {"type": "string"},
                            "min_cap_rate": {"type": "number"},
                            "max_cap_rate": {"type": "number"},
                            "property_type": {"type": "string"},
                            "min_units": {"type": "number"},
                            "max_units": {"type": "number"}
                        },
                        "description": "Search filters for property search"
                    },
                    "property_id": {
                        "type": "string",
                        "description": "Property ID for document generation"
                    }
                },
                "required": ["action", "message"]
            }
        }
    
    def _parse_function_result(self, function_result: Dict[str, Any], content: str) -> AIProcessingResult:
        """Parse the structured function result from OpenAI."""
        action_map = {
            "search_properties": ChatAction.SEARCH_PROPERTIES,
            "generate_underwriting": ChatAction.GENERATE_UNDERWRITING, 
            "generate_loi": ChatAction.GENERATE_LOI,
            "general_response": ChatAction.GENERAL_RESPONSE
        }
        
        action = action_map.get(function_result.get("action"), ChatAction.GENERAL_RESPONSE)
        message = function_result.get("message", content)
        
        return AIProcessingResult(
            message=message,
            action=action,
            extracted_filters=function_result.get("search_filters"),
            property_id=function_result.get("property_id"),
            confidence=0.9  # High confidence for structured response
        )
    
    def _parse_content_response(self, content: str) -> AIProcessingResult:
        """Fallback parsing for content-only responses."""
        content_lower = content.lower()
        
        # Simple keyword matching for fallback
        if any(keyword in content_lower for keyword in ["find", "search", "look for", "properties"]):
            action = ChatAction.SEARCH_PROPERTIES
        elif any(keyword in content_lower for keyword in ["underwriting", "analysis", "financials"]):
            action = ChatAction.GENERATE_UNDERWRITING
        elif any(keyword in content_lower for keyword in ["loi", "letter of intent", "offer"]):
            action = ChatAction.GENERATE_LOI
        else:
            action = ChatAction.GENERAL_RESPONSE
            
        return AIProcessingResult(
            message=content,
            action=action,
            confidence=0.6  # Lower confidence for keyword matching
        )
    
    def parse_search_query(self, query: str) -> Dict[str, Any]:
        """Parse natural language query to extract search filters."""
        filters = {}
        query_lower = query.lower()
        
        # Extract price range using regex patterns
        import re
        
        # Price patterns
        price_patterns = [
            r'\$(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?\s*[-–—to]\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?',
            r'between\s+\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?\s+and\s+\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?',
            r'under\s+\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?',
            r'over\s+\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?'
        ]
        
        for i, pattern in enumerate(price_patterns):
            match = re.search(pattern, query_lower)
            if match:
                if i == 2:  # under pattern
                    filters["max_price"] = self._parse_price(match.group(1))
                elif i == 3:  # over pattern
                    filters["min_price"] = self._parse_price(match.group(1))
                else:  # range patterns
                    filters["min_price"] = self._parse_price(match.group(1))
                    filters["max_price"] = self._parse_price(match.group(2))
                break
        
        # Extract cap rate range
        cap_rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%?\s*[-–—to]\s*(\d+(?:\.\d+)?)\s*%?\s*cap\s*rate', query_lower)
        if cap_rate_match:
            filters["min_cap_rate"] = float(cap_rate_match.group(1))
            filters["max_cap_rate"] = float(cap_rate_match.group(2))
        
        # Extract location
        location_match = re.search(r'(?:in|near|around)\s+([a-zA-Z\s]+?)(?:\s|,|$)', query_lower)
        if location_match:
            filters["location"] = location_match.group(1).strip()
        
        return filters
    
    def _parse_price(self, price_str: str) -> float:
        """Parse price string and convert to float."""
        price = float(price_str.replace(',', ''))
        
        if 'm' in price_str.lower():
            price *= 1_000_000
        elif 'k' in price_str.lower():
            price *= 1_000
            
        return price