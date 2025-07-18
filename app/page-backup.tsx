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
    
    // Simulate response delay
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
    
    // Add user message to show they clicked View Model
    const userMessage: Message = {
      role: 'user',
      content: `Generate financial model for ${property.address}`,
      type: 'text'
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Generate financial model directly
    await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enhanced fallback model
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
    
    // Add user message to show they clicked Abstract OM
    const userMessage: Message = {
      role: 'user',
      content: `Generate offering memorandum for ${property.address}`,
      type: 'text'
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Generate offering memorandum directly
    await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enhanced fallback OM
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
    <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg border border-white/30 overflow-hidden hover:bg-white/25 transition-all duration-300 transform hover:scale-105">
      <div className="h-28 bg-gradient-to-r from-blue-400/60 to-purple-400/60 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-2 left-2">
          <div className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
            {property.capRate} CAP
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm font-bold text-white mb-1">{property.price}</div>
        <div className="text-xs font-semibold text-white/90 mb-1">{property.address}</div>
        <div className="text-xs text-white/70 mb-2">{property.location}</div>
        <div className="text-xs text-white/80 mb-3">{property.details}</div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewModel(property)}
            className="text-xs text-blue-200 hover:text-blue-100 font-medium hover:underline transition-colors"
          >
            View Model
          </button>
          <button 
            onClick={() => handleAbstractOM(property)}
            className="text-xs text-blue-200 hover:text-blue-100 font-medium hover:underline transition-colors"
          >
            Abstract OM
          </button>
        </div>
      </div>
    </div>
  );

  const UnderwritingChart = ({ data }: { data?: any }) => {
    const handleDownloadModel = async () => {
      if (!data?.property) return;
      
      try {
        // Create Excel-compatible CSV content
        const csvContent = [
          ['Financial Model', data?.property?.address || '1052 E Thomas St'],
          [''],
          ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
          ['Gross Income', '418824', '431289', '444228', '457555', '471482', '485827', '500602', '515820', '531495', '547640'],
          ['Vacancy (5%)', '20941', '21564', '22211', '22878', '23574', '24291', '25030', '25791', '26575', '27382'],
          ['Effective Income', '397883', '409725', '422017', '434677', '447907', '461536', '475572', '490029', '504920', '520258'],
          ['Operating Expenses', '139259', '142740', '146309', '149967', '153716', '157559', '161498', '165535', '169673', '173915'],
          ['Net Operating Income', '258624', '266985', '275708', '284710', '294191', '303977', '314074', '324494', '335247', '346343'],
          ['Debt Service', '164800', '164800', '164800', '164800', '164800', '164800', '164800', '164800', '164800', '164800'],
          ['Cash Flow', '93824', '102185', '110908', '119910', '129391', '139177', '149274', '159694', '170447', '181543']
        ].map(row => row.join(',')).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `${data?.property?.address?.replace(/\s+/g, '_') || 'Financial_Model'}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
      } catch (error) {
        console.error('Error generating Excel model:', error);
        alert('Excel model generation temporarily unavailable');
      }
    };

    // Create Excel-style spreadsheet data
    const spreadsheetData = [
      ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
      ['Gross Income', '$418,824', '$431,289', '$444,228', '$457,555', '$471,482', '$485,827', '$500,602', '$515,820', '$531,495', '$547,640'],
      ['Vacancy (5%)', '$20,941', '$21,564', '$22,211', '$22,878', '$23,574', '$24,291', '$25,030', '$25,791', '$26,575', '$27,382'],
      ['Effective Income', '$397,883', '$409,725', '$422,017', '$434,677', '$447,907', '$461,536', '$475,572', '$490,029', '$504,920', '$520,258'],
      ['Operating Expenses', '$139,259', '$142,740', '$146,309', '$149,967', '$153,716', '$157,559', '$161,498', '$165,535', '$169,673', '$173,915'],
      ['Net Operating Income', '$258,624', '$266,985', '$275,708', '$284,710', '$294,191', '$303,977', '$314,074', '$324,494', '$335,247', '$346,343'],
      ['Debt Service', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800', '$164,800'],
      ['Cash Flow', '$93,824', '$102,185', '$110,908', '$119,910', '$129,391', '$139,177', '$149,274', '$159,694', '$170,447', '$181,543']
    ];

    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg border border-white/30 p-4 max-w-4xl mx-auto">
        {/* Excel-style spreadsheet interface with glass morphism */}
        <div className="mb-4">
          {/* Column headers and row styling to look like Excel */}
          <div className="border border-white/30 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
            {/* Header row */}
            <div className="bg-white/20 backdrop-blur-sm border-b border-white/30">
              {spreadsheetData[0].map((header, index) => (
                <div key={index} className={`inline-block text-xs font-medium text-white p-2 border-r border-white/30 ${index === 0 ? 'w-36' : 'w-20'} text-center`}>
                  {header}
                </div>
              ))}
            </div>
            
            {/* Data rows */}
            {spreadsheetData.slice(1).map((row, rowIndex) => (
              <div key={rowIndex} className={`border-b border-white/20 ${rowIndex === spreadsheetData.length - 2 ? 'bg-green-400/20' : 'bg-white/5'}`}>
                {row.map((cell, cellIndex) => (
                  <div key={cellIndex} className={`inline-block text-xs p-2 border-r border-white/20 ${cellIndex === 0 ? 'w-36 font-medium text-white/90' : 'w-20 text-center font-mono'} ${rowIndex === spreadsheetData.length - 2 ? 'font-bold text-green-200' : 'text-white/80'}`}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-white mb-1">
            Underwriting: {data?.property?.address || data?.address || '1052 E Thomas St'}
          </h3>
          <div className="text-sm text-white/70 mb-4">
            {data?.property?.location || 'Seattle WA 98102'}
          </div>
          <div className="flex space-x-3">
            <button className="text-sm text-blue-200 hover:text-blue-100 font-medium hover:underline transition-colors">
              Generate LOI
            </button>
            <button 
              onClick={handleDownloadModel}
              className="text-sm text-green-200 hover:text-green-100 font-medium hover:underline transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LOIDocument = ({ data }: { data?: any }) => {
    const handleDraftEmail = () => {
      const subject = `Submission of LOI for ${data?.address || '1052 E Thomas St'}, Seattle, WA`;
      const body = `Dear team@rets.ai,

We are pleased to submit this Letter of Intent for the acquisition of ${data?.address || '1052 E Thomas St'} in Seattle, WA.

Please find the LOI attached for your review and consideration.

Best regards,
[Your Name]`;
      
      // Create mailto link
      const mailtoLink = `mailto:team@rets.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    };

    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg border border-white/30 p-4 max-w-md mx-auto">
        <div className="mb-4">
          {/* Document preview with glass morphism */}
          <div className="h-64 bg-white/10 backdrop-blur-sm border border-white/30 rounded mb-4 p-3 overflow-hidden">
            <div className="text-xs leading-tight text-white/90 space-y-2">
              <div className="text-center font-bold mb-3">LETTER OF INTENT</div>
              <div><strong>Property:</strong> {data?.address || '1052 E Thomas St'}</div>
              <div><strong>Location:</strong> {data?.location || 'Seattle, WA 98102'}</div>
              <div><strong>Purchase Price:</strong> {data?.price || '$6,950,000'}</div>
              <div><strong>Earnest Money:</strong> $100,000</div>
              <div><strong>Inspection Period:</strong> 30 days</div>
              <div><strong>Financing:</strong> Conventional</div>
              <div><strong>Closing Date:</strong> 60 days from acceptance</div>
              <div className="pt-2 border-t border-white/30 mt-3">
                <div className="text-xs">This Letter of Intent outlines the basic terms and conditions for the potential acquisition of the above-referenced property. This LOI is non-binding and subject to due diligence, financing approval, and execution of a definitive purchase agreement.</div>
              </div>
              <div className="pt-2">
                <div className="text-xs"><strong>Buyer:</strong> [Buyer Name]</div>
                <div className="text-xs"><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-white mb-1">Letter of Intent</h3>
          <div className="text-sm text-white/70 mb-3">LOI: {data?.address || '1052 E Thomas St'} | RETS.ai</div>
          <button 
            onClick={handleDraftEmail}
            className="text-sm text-blue-200 hover:text-blue-100 hover:underline font-medium transition-colors"
          >
            Draft me an email to send this
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glass Morphism Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-purple-500/20 to-pink-500/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Main Glass Container */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button className="w-6 h-6 flex flex-col justify-center items-center space-y-1 hover:bg-white/20 rounded p-1 transition-all duration-200">
                  <div className="w-4 h-0.5 bg-white/80"></div>
                  <div className="w-4 h-0.5 bg-white/80"></div>
                  <div className="w-4 h-0.5 bg-white/80"></div>
                </button>
                <span className="text-white font-medium">RETS</span>
                <span className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded backdrop-blur-sm">v3</span>
              </div>
              <button className="text-white/80 hover:text-white text-sm transition-colors">Light</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6">
          {/* Welcome Section - Centered */}
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-white mb-16 drop-shadow-lg">
                  Who needs manual tasks? Ask RETS instead.
                </h1>
              </div>
              
              <div className="w-full max-w-2xl">
                <div className="flex items-center bg-white/20 backdrop-blur-lg rounded-full shadow-2xl border border-white/30 px-4 py-3 hover:bg-white/25 transition-all duration-300">
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" opacity="0.8"/>
                      <circle cx="12" cy="16" r="1" fill="white" opacity="0.8"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" opacity="0.8"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask RETS to do anything"
                    className="flex-1 outline-none text-white placeholder-white/70 bg-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 disabled:opacity-50 ml-2 transition-all duration-200 border border-white/30"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="text-sm text-white/70 mt-2 text-center drop-shadow-sm">RETS.ai can make mistakes. Verify for accuracy.</div>
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
                        <div className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg max-w-2xl border border-white/30 shadow-lg">
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
                        
                        {msg.type === 'underwriting' && (
                          <div className="flex justify-center mb-8">
                            <UnderwritingChart data={msg.data} />
                          </div>
                        )}
                        
                        {msg.type === 'loi' && (
                          <div className="flex justify-center mb-8">
                            <LOIDocument data={msg.data} />
                          </div>
                        )}
                        
                        <div className="text-white drop-shadow-sm">{msg.content}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start mb-4 max-w-4xl mx-auto">
                    <div className="bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-lg border border-white/30 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Input Section - Floating at bottom after first message with glass morphism */}
        {chatHistory.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white/20 backdrop-blur-lg rounded-full shadow-2xl border border-white/30 px-4 py-3 hover:bg-white/25 transition-all duration-300">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" opacity="0.8"/>
                    <circle cx="12" cy="16" r="1" fill="white" opacity="0.8"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" opacity="0.8"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message RETS"
                  className="flex-1 outline-none text-white placeholder-white/70 bg-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 disabled:opacity-50 ml-2 transition-all duration-200 border border-white/30"
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
  );
}