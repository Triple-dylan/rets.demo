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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
        content: 'I\'m RETS AI, your real estate assistant. How can I help you?',
        type: 'text'
      };
    }
    
    setChatHistory([...newHistory, response]);
    setLoading(false);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleViewModel = async (property: Property) => {
    setSelectedProperty(property);
    setLoading(true);
    
    const userMessage: Message = {
      role: 'user',
      content: `Generate financial model for ${property.address}`,
      type: 'text'
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
      
    const purchasePrice = parseInt(property.price.replace(/[$,]/g, ''));
    const capRate = parseFloat(property.capRate);
    const noi = Math.round(purchasePrice * (capRate / 100));
    const basicModelData = {
      property,
      purchasePrice,
      address: property.address,
      price: property.price,
      capRate: capRate,
      noi: noi,
      grossIncome: Math.round(noi / 0.85),
      cashFlow: Math.round(noi * 0.6),
      cashOnCash: 0.125,
      irr: 14.2,
      totalReturn: capRate + 12.5,
      projections: Array.from({length: 10}, (_, i) => ({
        year: i + 1,
        income: Math.round((noi / 0.85) * Math.pow(1.03, i)),
        expenses: Math.round((noi * 0.15) * Math.pow(1.025, i)),
        noi: Math.round(noi * Math.pow(1.03, i)),
        cashFlow: Math.round(noi * 0.6 * Math.pow(1.03, i))
      })),
      marketComps: [
        {address: "1420 E Pine St", price: `$${(purchasePrice * 1.1).toLocaleString()}`, capRate: `${(capRate - 0.3).toFixed(1)}%`},
        {address: "950 Taylor Ave N", price: `$${(purchasePrice * 0.95).toLocaleString()}`, capRate: `${(capRate + 0.2).toFixed(1)}%`}
      ]
    };
      
    const fallbackMessage: Message = {
      role: 'assistant',
      content: `**Financial Model Generated for ${property.address}**\n\nAnalysis complete. This ${property.details.includes('unit') ? property.details.split('-')[0] + '-unit' : 'multifamily'} property shows strong fundamentals with a ${property.capRate} cap rate.\n\n**Key Highlights:**\n• NOI: $${noi.toLocaleString()}\n• Strong cash flow potential\n• Seattle market fundamentals support growth\n• Recommended for acquisition consideration`,
      type: 'underwriting',
      data: basicModelData
    };
    
    setChatHistory(prev => [...prev, fallbackMessage]);
    
    setLoading(false);
  };

  const handleAbstractOM = async (property: Property) => {
    setLoading(true);
    
    const userMessage: Message = {
      role: 'user',
      content: `Generate offering memorandum for ${property.address}`,
      type: 'text'
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
      
    const units = property.details.includes('unit') ? parseInt(property.details.split('-')[0]) : 25;
    const purchasePrice = parseInt(property.price.replace(/[$,]/g, ''));
    
    const fallbackOM = {
      address: property.address,
      location: property.location,
      price: property.price,
      executiveSummary: `**Investment Opportunity - ${property.address}**\n\nThis ${units}-unit multifamily property presents a compelling investment opportunity in Seattle's dynamic rental market. The asset delivers a ${property.capRate} cap rate with strong fundamentals and upside potential.\n\nLocated in a desirable Seattle submarket, the property benefits from proximity to major employment centers, excellent transportation connectivity, and robust demographic trends. With Seattle's continued growth and limited supply, this asset is positioned for consistent cash flow and appreciation.`,
      financialHighlights: {
        purchasePrice: property.price,
        capRate: property.capRate,
        pricePerUnit: `$${Math.round(purchasePrice / units).toLocaleString()}`,
        totalUnits: units
      },
      investmentHighlights: [
        `Strong ${property.capRate} cap rate in premium Seattle submarket`,
        `${units}-unit multifamily asset with stable income profile`,
        "Proximity to major employment centers",
        "Value-add opportunities through improvements",
        "Strong Seattle rental market fundamentals"
      ]
    };
      
    const fallbackMessage: Message = {
      role: 'assistant',
      content: `**Offering Memorandum Generated for ${property.address}**\n\n${fallbackOM.executiveSummary}\n\n**Investment Highlights:**\n${fallbackOM.investmentHighlights.map(h => `• ${h}`).join('\n')}\n\n**Financial Summary:**\n• Purchase Price: ${property.price}\n• Cap Rate: ${property.capRate}\n• Price per Unit: ${fallbackOM.financialHighlights.pricePerUnit}`,
      type: 'loi',
      data: fallbackOM
    };
    
    setChatHistory(prev => [...prev, fallbackMessage]);
    
    setLoading(false);
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-lg border border-gray-200/50 overflow-hidden hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
      <div className="h-28 bg-gradient-to-r from-gray-100 to-gray-200 relative">
        <div className="absolute bottom-2 left-2">
          <div className="text-gray-700 text-xs font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-gray-300">
            {property.capRate} CAP
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm font-bold text-gray-900 mb-1">{property.price}</div>
        <div className="text-xs font-semibold text-gray-800 mb-1">{property.address}</div>
        <div className="text-xs text-gray-600 mb-2">{property.location}</div>
        <div className="text-xs text-gray-700 mb-3">{property.details}</div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewModel(property)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            View Model
          </button>
          <button 
            onClick={() => handleAbstractOM(property)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            Abstract OM
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-gray-100/60 to-white/90"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen">
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button className="w-6 h-6 flex flex-col justify-center items-center space-y-1 hover:bg-gray-100/50 rounded p-1 transition-all duration-200">
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                </button>
                <span className="text-gray-900 font-medium">RETS</span>
                <span className="text-sm text-gray-600 bg-gray-100/80 px-2 py-1 rounded backdrop-blur-sm">v3</span>
              </div>
              <button className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Light</button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-16">
                  Who needs manual tasks? Ask RETS instead.
                </h1>
              </div>
              
              <div className="w-full max-w-2xl">
                <div className="flex items-center bg-white/70 backdrop-blur-lg rounded-full shadow-2xl border border-gray-200/50 px-4 py-3 hover:bg-white/80 transition-all duration-300">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask RETS to do anything"
                    className="flex-1 outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 ml-2 transition-all duration-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-2 text-center">RETS.ai can make mistakes. Verify for accuracy.</div>
              </div>
            </div>
          )}

          {chatHistory.length > 0 && (
            <div className="pb-32">
              <div className="space-y-8">
                {chatHistory.map((msg, index) => (
                  <div key={index} className="max-w-4xl mx-auto">
                    {msg.role === 'user' && (
                      <div className="flex justify-end mb-6">
                        <div className="bg-white/70 backdrop-blur-lg text-gray-900 px-4 py-2 rounded-lg max-w-2xl border border-gray-200/50 shadow-lg">
                          {msg.content}
                        </div>
                      </div>
                    )}
                    
                    {msg.role === 'assistant' && (
                      <div className="space-y-6">
                        {msg.type === 'properties' && msg.data && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {msg.data.map((property: Property) => (
                              <PropertyCard key={property.id} property={property} />
                            ))}
                          </div>
                        )}
                        
                        <div className="text-gray-900">{msg.content}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start mb-4 max-w-4xl mx-auto">
                    <div className="bg-white/70 backdrop-blur-lg text-gray-900 px-4 py-2 rounded-lg border border-gray-200/50 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {chatHistory.length > 0 && (
            <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center bg-white/70 backdrop-blur-lg rounded-full shadow-2xl border border-gray-200/50 px-4 py-3 hover:bg-white/80 transition-all duration-300">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message RETS"
                    className="flex-1 outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 ml-2 transition-all duration-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}