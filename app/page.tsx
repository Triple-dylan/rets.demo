'use client';

import { useState } from 'react';

interface Property {
  id: number;
  image: string;
  price: string;
  address: string;
  location: string;
  details: string;
  capRate: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'properties' | 'underwriting' | 'loi';
  data?: any;
}

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Mock properties data to match screenshots
  const mockProperties: Property[] = [
    {
      id: 1,
      image: "/api/placeholder/300/200",
      price: "$6,950,000",
      address: "1052 E Thomas St",
      location: "Seattle, WA 98102",
      details: "29-unit apartment • 5.07% cap rate",
      capRate: "5.07%"
    },
    {
      id: 2,
      image: "/api/placeholder/300/200",
      price: "$7,200,000",
      address: "603 Pontius Ave N",
      location: "Seattle, WA 98109",
      details: "30-unit apartment • 5.00% cap rate",
      capRate: "5.00%"
    },
    {
      id: 3,
      image: "/api/placeholder/300/200",
      price: "$6,950,000",
      address: "7060 Lincoln Park Way SW",
      location: "Seattle, WA 98136",
      details: "23-unit apartment • 4.53% cap rate",
      capRate: "4.53%"
    },
    {
      id: 4,
      image: "/api/placeholder/300/200", 
      price: "$4,750,000",
      address: "4270 NE 50th St",
      location: "Seattle, WA 98105",
      details: "8-unit apartment • 3.77% cap rate",
      capRate: "3.77%"
    },
    {
      id: 5,
      image: "/api/placeholder/300/200",
      price: "$5,200,000", 
      address: "213 1st Ave S",
      location: "Seattle, WA 98104",
      details: "13-unit apartment • 5.49% cap rate",
      capRate: "5.49%"
    }
  ];

  // Sample prompts for suggestions
  const samplePrompts = [
    "Find me properties that fit my buy box in Seattle, $5-7M and a cap rate between 4-6%",
    "Show me multifamily properties under $5M in downtown Seattle",
    "Generate underwriting analysis for commercial properties",
    "What are the best investment opportunities in the Pacific Northwest?"
  ];

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    const newHistory = [...chatHistory, { role: 'user' as const, content: message }];
    setChatHistory(newHistory);
    
    try {
      // Call the actual API endpoint
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newHistory })
      });
      
      if (!res.ok) {
        throw new Error('API request failed');
      }
      
      const apiResponse = await res.json();
      
      let response: Message;
      
      if (message.toLowerCase().includes('find') || message.toLowerCase().includes('properties') || message.toLowerCase().includes('seattle')) {
        response = {
          role: 'assistant',
          content: 'I have completed the deal sourcing task and I\'m happy to assist with it. Is there anything else you need help with?',
          type: 'properties',
          data: mockProperties
        };
      } else if (message.toLowerCase().includes('underwriting') || message.toLowerCase().includes('1052')) {
        response = {
          role: 'assistant', 
          content: 'The underwriting analysis task is complete. I\'m happy to assist with this. Is there anything else you need help with?',
          type: 'underwriting',
          data: { address: '1052 E Thomas St', location: 'Seattle WA 98102' }
        };
      } else if (message.toLowerCase().includes('loi')) {
        response = {
          role: 'assistant',
          content: 'I\'m happy to have helped with the LOI generation. Is there anything else you need assistance with?',
          type: 'loi',
          data: { address: '1052 E Thomas St', location: 'Seattle WA 98102' }
        };
      } else {
        response = {
          role: 'assistant',
          content: apiResponse.message || 'I\'m RETS AI, your real estate assistant. How can I help you?',
          type: 'text'
        };
      }
      
      setChatHistory([...newHistory, response]);
    } catch (error) {
      console.error('API Error:', error);
      const errorResponse: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again.',
        type: 'text'
      };
      setChatHistory([...newHistory, errorResponse]);
    }
    
    setLoading(false);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleViewModel = (property: Property) => {
    setSelectedProperty(property);
    // Create mock financial model data
    const modelData = {
      address: property.address,
      price: property.price,
      capRate: property.capRate,
      noi: Math.round(parseInt(property.price.replace(/[$,]/g, '')) * parseFloat(property.capRate) / 100),
      cashFlow: Math.round(parseInt(property.price.replace(/[$,]/g, '')) * 0.02),
      roi: '12.5%'
    };
    
    const modelMessage: Message = {
      role: 'assistant',
      content: `Financial model generated for ${property.address}. Here's the detailed analysis:`,
      type: 'underwriting',
      data: modelData
    };
    
    setChatHistory(prev => [...prev, modelMessage]);
  };

  const handleAbstractOM = (property: Property) => {
    // Create offering memorandum
    const omMessage: Message = {
      role: 'assistant',
      content: `Offering Memorandum generated for ${property.address}. This comprehensive document includes property details, financial projections, and investment highlights.`,
      type: 'loi',
      data: { address: property.address, location: property.location, price: property.price }
    };
    
    setChatHistory(prev => [...prev, omMessage]);
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-400 relative">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute bottom-3 left-3">
          <div className="text-white text-xs font-medium bg-black bg-opacity-30 px-2 py-1 rounded">
            {property.capRate} CAP
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-2xl font-bold text-gray-900 mb-2">{property.price}</div>
        <div className="text-base font-semibold text-gray-800 mb-1">{property.address}</div>
        <div className="text-sm text-gray-500 mb-3">{property.location}</div>
        <div className="text-sm text-gray-600 mb-4">{property.details}</div>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleViewModel(property)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            View Model
          </button>
          <button 
            onClick={() => handleAbstractOM(property)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            Abstract OM
          </button>
        </div>
      </div>
    </div>
  );

  const UnderwritingChart = ({ data }: { data?: any }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="h-40 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border mb-4 flex items-center justify-center relative overflow-hidden">
          {/* Mock chart visualization */}
          <div className="absolute inset-0 p-4">
            <div className="flex items-end justify-between h-full">
              <div className="w-8 bg-green-500 h-3/4 rounded-t"></div>
              <div className="w-8 bg-blue-500 h-1/2 rounded-t"></div>
              <div className="w-8 bg-purple-500 h-2/3 rounded-t"></div>
              <div className="w-8 bg-orange-500 h-4/5 rounded-t"></div>
              <div className="w-8 bg-red-500 h-1/3 rounded-t"></div>
            </div>
          </div>
          <div className="absolute top-2 left-2 text-xs font-medium text-gray-600">Financial Analysis</div>
        </div>
      </div>
      
      {/* Financial Metrics */}
      {data && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">NOI</div>
            <div className="text-lg font-bold text-gray-900">${data.noi?.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Cash Flow</div>
            <div className="text-lg font-bold text-green-600">${data.cashFlow?.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Cap Rate</div>
            <div className="text-lg font-bold text-blue-600">{data.capRate}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">ROI</div>
            <div className="text-lg font-bold text-purple-600">{data.roi}</div>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-1">Underwriting: {data?.address || '1052 E Thomas St'}</h3>
        <div className="text-sm text-gray-600 mb-4">Seattle WA 98102</div>
        <div className="flex space-x-3">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
            Generate LOI
          </button>
          <button className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline transition-colors">
            Download
          </button>
        </div>
      </div>
    </div>
  );

  const LOIDocument = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md">
      <div className="mb-4">
        <div className="h-48 bg-gray-100 rounded border mb-4 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Letter of Intent Document</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1">Letter of Intent</h3>
        <div className="text-sm text-gray-600 mb-3">LOI: 1052 E Thomas St, LO| RETS.ai</div>
        <button className="text-sm text-blue-600 hover:underline">Download</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7ff' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button className="w-6 h-6 flex flex-col justify-center items-center space-y-1 hover:bg-gray-100 rounded p-1 transition-colors">
                <div className="w-4 h-0.5 bg-gray-600"></div>
                <div className="w-4 h-0.5 bg-gray-600"></div>
                <div className="w-4 h-0.5 bg-gray-600"></div>
              </button>
              <span className="text-gray-900 font-medium">RETS</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">v3</span>
            </div>
            <button className="text-gray-600 hover:text-gray-900 text-sm">Light</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6">
        {/* Welcome Section - Centered */}
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-16">
                Who needs manual tasks? Ask RETS instead.
              </h1>
            </div>
            
            <div className="w-full max-w-2xl">
              <div className="flex items-center bg-white rounded-full shadow-sm border border-blue-200 px-4 py-3">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask RETS to do anything"
                  className="flex-1 outline-none text-gray-700 placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 ml-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-2 text-center">RETS.ai can make mistakes. Verify for accuracy.</div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {chatHistory.length > 0 && (
          <div className="pb-32">
            <div className="space-y-8">
              {chatHistory.map((msg, index) => (
                <div key={index} className="max-w-4xl mx-auto">
                  {msg.role === 'user' && (
                    <div className="flex justify-end mb-6">
                      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-2xl">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && (
                    <div className="space-y-6">
                      {msg.type === 'properties' && msg.data && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {msg.data.map((property: Property) => (
                            <PropertyCard key={property.id} property={property} />
                          ))}
                        </div>
                      )}
                      
                      {msg.type === 'underwriting' && (
                        <div className="flex justify-center mb-8">
                          <UnderwritingChart data={msg.data} />
                        </div>
                      )}
                      
                      {msg.type === 'loi' && (
                        <div className="flex justify-center mb-8">
                          <LOIDocument />
                        </div>
                      )}
                      
                      <div className="text-gray-700">{msg.content}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start mb-4 max-w-4xl mx-auto">
                  <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                    Thinking ...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Section - Fixed at bottom after first message */}
        {chatHistory.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-sm border border-blue-200 px-4 py-3">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message RETS"
                  className="flex-1 outline-none text-gray-700 placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 ml-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}