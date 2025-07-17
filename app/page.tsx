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

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    const newHistory = [...chatHistory, { role: 'user' as const, content: message }];
    setChatHistory(newHistory);
    
    // Simulate different response types based on message content
    setTimeout(() => {
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
          content: 'I\'m RETS AI, your real estate assistant. I can help you find properties, generate underwriting analysis, and create LOI documents. What would you like me to help you with?',
          type: 'text'
        };
      }
      
      setChatHistory([...newHistory, response]);
      setLoading(false);
      setMessage('');
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-40 bg-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"></div>
      </div>
      <div className="p-4">
        <div className="text-xl font-bold text-gray-900 mb-1">{property.price}</div>
        <div className="text-sm font-medium text-gray-900 mb-1">{property.address}</div>
        <div className="text-sm text-gray-600 mb-2">{property.location}</div>
        <div className="text-sm text-gray-600 mb-3">{property.details}</div>
        <div className="flex space-x-2">
          <button className="text-sm text-blue-600 hover:underline">View Model</button>
          <button className="text-sm text-blue-600 hover:underline">Abstract OM</button>
        </div>
      </div>
    </div>
  );

  const UnderwritingChart = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md">
      <div className="mb-4">
        <div className="h-32 bg-gray-100 rounded border mb-4 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Underwriting Analysis Chart</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1">Underwriting: 1052 E Thomas St</h3>
        <div className="text-sm text-gray-600 mb-3">Seattle WA 98102</div>
        <div className="flex space-x-4">
          <button className="text-sm text-blue-600 hover:underline">Generate LOI</button>
          <button className="text-sm text-blue-600 hover:underline">Download</button>
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span className="text-gray-900 font-medium">RETS</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">v3</span>
            </div>
            <button className="text-gray-600 hover:text-gray-900 text-sm">Light</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        {chatHistory.length === 0 && (
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Who needs manual tasks? Ask RETS instead.
            </h1>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-sm border border-blue-200 px-4 py-3">
                <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Find me properties that fit my buy box in Seattle, $5-7M and a cap rate between 4-6%"
                  className="flex-1 outline-none text-gray-700 placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 ml-2"
                >
                  →
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-2">RETS.ai can make mistakes. Verify for accuracy.</div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index}>
              {msg.role === 'user' && (
                <div className="flex justify-end mb-4">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-2xl">
                    {msg.content}
                  </div>
                </div>
              )}
              
              {msg.role === 'assistant' && (
                <div className="space-y-4">
                  {msg.type === 'properties' && msg.data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {msg.data.map((property: Property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                  
                  {msg.type === 'underwriting' && (
                    <div className="flex justify-center mb-6">
                      <UnderwritingChart />
                    </div>
                  )}
                  
                  {msg.type === 'loi' && (
                    <div className="flex justify-center mb-6">
                      <LOIDocument />
                    </div>
                  )}
                  
                  <div className="text-gray-700 mb-6">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                Thinking ...
              </div>
            </div>
          )}
        </div>

        {/* Input Section - appears after first message */}
        {chatHistory.length > 0 && (
          <div className="sticky bottom-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-sm border border-blue-200 px-4 py-3">
                <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
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
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}