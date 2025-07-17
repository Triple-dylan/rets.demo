export interface Property {
  id: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrl: string;
  units: number;
  capRate: number;
  propertyType: string;
  yearBuilt?: number;
  squareFootage?: number;
  lotSize?: string;
  description?: string;
  amenities?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minCapRate?: number;
  maxCapRate?: number;
  propertyType?: string;
  minUnits?: number;
  maxUnits?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  searchQuery: string;
}