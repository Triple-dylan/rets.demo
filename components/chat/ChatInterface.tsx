'use client';

import React, { useState, useRef, useEffect } from 'react';
import { apiService, ChatRequest, Property } from '@/services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import PropertyGrid from '../property/PropertyGrid';
import UnderwritingChart from '../documents/UnderwritingChart';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'property_results' | 'document_generation';
  data?: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowTyping(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to Python backend
      const request: ChatRequest = {
        message: content,
        conversationHistory
      };

      const response = await apiService.chat(request);
      
      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowTyping(false);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
        type: response.action === 'search_properties' ? 'property_results' : 
              response.action === 'generate_underwriting' ? 'document_generation' : 'text',
        data: response.data
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      setShowTyping(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to the backend. Please make sure the Python server is running on port 8000.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertySelect = (property: Property) => {
    const message = `Generate underwriting for "${property.address}"`;
    handleSendMessage(message);
  };

  const handleDocumentDownload = async (type: 'underwriting' | 'loi', propertyId: string) => {
    try {
      await apiService.downloadDocument(type, propertyId);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.type === 'property_results' && message.data?.properties) {
      return (
        <div className="mt-4">
          <PropertyGrid 
            properties={message.data.properties}
            onPropertySelect={handlePropertySelect}
          />
          {message.data.properties.length > 0 && (
            <div className="mt-6 text-sm text-gray-600">
              I have completed the deal sourcing task and I'm happy to assist with it. Is there anything else you need help with?
            </div>
          )}
        </div>
      );
    }

    if (message.type === 'document_generation' && message.data) {
      return (
        <div className="mt-4">
          <UnderwritingChart 
            data={message.data}
            onDownload={() => handleDocumentDownload('underwriting', message.data.propertyId)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Who needs manual tasks? Ask RETS instead.
          </h1>
          <div className="max-w-2xl mx-auto">
            <ChatInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Find me properties that fit my buy box in Seattle, $5-7M and a cap rate between 4-6%"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-0 mb-8">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message}>
              {renderMessageContent(message)}
            </MessageBubble>
          ))}
          
          {showTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chat Input (when there are messages) */}
      {messages.length > 0 && (
        <div className="sticky bottom-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg">
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}