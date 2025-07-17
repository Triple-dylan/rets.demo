// API service for communicating with Python backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{role: string; content: string}>;
}

export interface ChatResponse {
  message: string;
  action: string;
  data?: any;
  searchFilters?: any;
  propertyId?: string;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  searchQuery: string;
}

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

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = [
      { role: 'user', content: request.message }
    ];
    
    if (request.conversationHistory) {
      messages.unshift(...request.conversationHistory);
    }

    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      message: data.message,
      action: 'chat',
      data: null
    };
  }

  async searchProperties(
    query: string,
    filters?: any
  ): Promise<PropertySearchResult> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseURL}/api/properties?${params}`);

    if (!response.ok) {
      throw new Error(`Properties API error: ${response.statusText}`);
    }

    const properties = await response.json();
    return {
      properties,
      totalCount: properties.length,
      searchQuery: query
    };
  }

  async getProperty(id: string): Promise<Property> {
    const response = await fetch(`${this.baseURL}/api/properties/${id}`);

    if (!response.ok) {
      throw new Error(`Property API error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateDocument(
    type: 'underwriting' | 'loi',
    propertyId: string,
    offerPrice?: number
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        propertyId,
        offerPrice,
      }),
    });

    if (!response.ok) {
      throw new Error(`Document API error: ${response.statusText}`);
    }

    return response.json();
  }

  getDownloadUrl(
    type: 'underwriting' | 'loi',
    propertyId: string,
    offerPrice?: number
  ): string {
    const params = new URLSearchParams({
      type,
      propertyId,
    });

    if (offerPrice) {
      params.append('offerPrice', String(offerPrice));
    }

    return `${this.baseURL}/api/documents/download?${params}`;
  }

  async downloadDocument(
    type: 'underwriting' | 'loi',
    propertyId: string,
    offerPrice?: number
  ): Promise<void> {
    const url = this.getDownloadUrl(type, propertyId, offerPrice);
    
    // Create a temporary link and click it to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

export const apiService = new ApiService();