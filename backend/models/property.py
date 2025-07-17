from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class PropertyType(str, Enum):
    APARTMENT = "apartment"
    OFFICE = "office"
    RETAIL = "retail"
    INDUSTRIAL = "industrial"
    MIXED_USE = "mixed_use"

class Coordinates(BaseModel):
    lat: float
    lng: float

class Property(BaseModel):
    id: str
    price: float = Field(..., gt=0)
    address: str
    city: str
    state: str
    zip_code: str = Field(..., alias="zipCode")
    image_url: str = Field(..., alias="imageUrl")
    units: int = Field(..., gt=0)
    cap_rate: float = Field(..., alias="capRate")
    property_type: PropertyType = Field(..., alias="propertyType")
    year_built: Optional[int] = Field(None, alias="yearBuilt")
    square_footage: Optional[int] = Field(None, alias="squareFootage")
    lot_size: Optional[str] = Field(None, alias="lotSize")
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    coordinates: Optional[Coordinates] = None

    class Config:
        allow_population_by_field_name = True
        use_enum_values = True

class PropertySearchFilters(BaseModel):
    min_price: Optional[float] = Field(None, alias="minPrice")
    max_price: Optional[float] = Field(None, alias="maxPrice")
    location: Optional[str] = None
    min_cap_rate: Optional[float] = Field(None, alias="minCapRate")
    max_cap_rate: Optional[float] = Field(None, alias="maxCapRate")
    property_type: Optional[PropertyType] = Field(None, alias="propertyType")
    min_units: Optional[int] = Field(None, alias="minUnits")
    max_units: Optional[int] = Field(None, alias="maxUnits")

    class Config:
        allow_population_by_field_name = True

class PropertySearchResult(BaseModel):
    properties: List[Property]
    total_count: int = Field(..., alias="totalCount")
    search_query: str = Field(..., alias="searchQuery")

    class Config:
        allow_population_by_field_name = True