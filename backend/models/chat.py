from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class MessageType(str, Enum):
    TEXT = "text"
    PROPERTY_RESULTS = "property_results"
    DOCUMENT_GENERATION = "document_generation"

class ChatAction(str, Enum):
    SEARCH_PROPERTIES = "search_properties"
    GENERATE_UNDERWRITING = "generate_underwriting"
    GENERATE_LOI = "generate_loi"
    GENERAL_RESPONSE = "general_response"

class ChatMessage(BaseModel):
    id: str
    content: str
    role: MessageRole
    timestamp: datetime
    type: MessageType = MessageType.TEXT
    data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list, alias="conversationHistory")

    class Config:
        allow_population_by_field_name = True

class ChatResponse(BaseModel):
    message: str
    action: ChatAction
    data: Optional[Dict[str, Any]] = None
    search_filters: Optional[Dict[str, Any]] = Field(None, alias="searchFilters")
    property_id: Optional[str] = Field(None, alias="propertyId")

    class Config:
        allow_population_by_field_name = True

class AIProcessingResult(BaseModel):
    message: str
    action: ChatAction
    extracted_filters: Optional[Dict[str, Any]] = None
    property_id: Optional[str] = None
    confidence: Optional[float] = None