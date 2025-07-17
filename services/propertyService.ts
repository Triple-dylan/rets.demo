import { Property, PropertySearchFilters, PropertySearchResult } from '@/types/property';
import { mockProperties, extendedMockProperties } from '@/data/mockProperties';

export class PropertyService {
  private properties: Property[] = extendedMockProperties;

  async searchProperties(
    query: string,
    filters: PropertySearchFilters = {}
  ): Promise<PropertySearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredProperties = this.properties;

    // Apply location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filteredProperties = filteredProperties.filter(property =>
        property.city.toLowerCase().includes(location) ||
        property.address.toLowerCase().includes(location) ||
        property.state.toLowerCase().includes(location)
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(property => property.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(property => property.price <= filters.maxPrice!);
    }

    // Apply cap rate filters
    if (filters.minCapRate) {
      filteredProperties = filteredProperties.filter(property => property.capRate >= filters.minCapRate!);
    }
    if (filters.maxCapRate) {
      filteredProperties = filteredProperties.filter(property => property.capRate <= filters.maxCapRate!);
    }

    // Apply unit count filters
    if (filters.minUnits) {
      filteredProperties = filteredProperties.filter(property => property.units >= filters.minUnits!);
    }
    if (filters.maxUnits) {
      filteredProperties = filteredProperties.filter(property => property.units <= filters.maxUnits!);
    }

    // Apply property type filter
    if (filters.propertyType) {
      filteredProperties = filteredProperties.filter(property => 
        property.propertyType.toLowerCase() === filters.propertyType!.toLowerCase()
      );
    }

    // Parse natural language query for additional filtering
    const queryLower = query.toLowerCase();
    
    // Extract price range from query
    const priceMatch = queryLower.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?[-\s]*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[mk]?/);
    if (priceMatch) {
      const minPrice = this.parsePrice(priceMatch[1]);
      const maxPrice = this.parsePrice(priceMatch[2]);
      filteredProperties = filteredProperties.filter(property => 
        property.price >= minPrice && property.price <= maxPrice
      );
    }

    // Extract cap rate from query
    const capRateMatch = queryLower.match(/(\d+(?:\.\d+)?)\s*%?\s*[-\s]*(\d+(?:\.\d+)?)\s*%?\s*cap\s*rate/);
    if (capRateMatch) {
      const minCapRate = parseFloat(capRateMatch[1]);
      const maxCapRate = parseFloat(capRateMatch[2]);
      filteredProperties = filteredProperties.filter(property => 
        property.capRate >= minCapRate && property.capRate <= maxCapRate
      );
    }

    return {
      properties: filteredProperties,
      totalCount: filteredProperties.length,
      searchQuery: query
    };
  }

  async getPropertyById(id: string): Promise<Property | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.properties.find(property => property.id === id) || null;
  }

  private parsePrice(priceStr: string): number {
    // Remove commas and convert to number
    let price = parseFloat(priceStr.replace(/,/g, ''));
    
    // Handle M (million) and K (thousand) suffixes
    if (priceStr.toLowerCase().includes('m')) {
      price *= 1000000;
    } else if (priceStr.toLowerCase().includes('k')) {
      price *= 1000;
    }
    
    return price;
  }

  // Method to extract search filters from natural language
  parseSearchQuery(query: string): PropertySearchFilters {
    const filters: PropertySearchFilters = {};
    const queryLower = query.toLowerCase();

    // Extract location
    const locationWords = ['in', 'near', 'around', 'seattle', 'bellevue', 'tacoma', 'portland'];
    for (const word of locationWords) {
      if (queryLower.includes(word)) {
        filters.location = word === 'in' || word === 'near' || word === 'around' 
          ? queryLower.split(word)[1]?.trim().split(' ')[0] 
          : word;
        break;
      }
    }

    return filters;
  }
}