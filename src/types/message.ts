export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'property_results' | 'document_generation';
  data?: any; // For structured data like property results or document info
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentTypingMessage?: string;
}

export interface PropertySearchMessage extends ChatMessage {
  type: 'property_results';
  data: {
    searchQuery: string;
    properties: Property[];
    totalCount: number;
  };
}

export interface DocumentGenerationMessage extends ChatMessage {
  type: 'document_generation';
  data: {
    documentType: 'underwriting' | 'loi';
    property?: Property;
    status: 'generating' | 'complete';
    downloadUrl?: string;
  };
}

import { Property } from './property';