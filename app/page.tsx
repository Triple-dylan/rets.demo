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
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: 'Seattle Properties', active: true },
    { id: 2, name: 'Portland Market', active: false },
    { id: 3, name: 'Analysis Draft', active: false }
  ]);
  const [chatFocused, setChatFocused] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const handleWorkspaceSwitch = (workspaceId: number) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      active: ws.id === workspaceId
    })));
    setWorkspaceMenuOpen(false);
    // In a real app, this would also change the context/data for the workspace
  };

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
    
    // Enhanced model data with realistic assumptions
    const modelData = {
      property,
      purchasePrice,
      address: property.address,
      price: property.price,
      capRate: capRate,
      noi: noi,
      grossIncome: Math.round(noi / 0.85),
      cashFlow: Math.round(noi * 0.6),
      cashOnCash: 12.5,
      irr: 14.2,
      totalReturn: capRate + 12.5,
      // Detailed assumptions based on Seattle market
      assumptions: {
        // Revenue assumptions
        monthlyRentPerUnit: Math.round((noi / 0.85) / property.details.split('-')[0] / 12),
        rentGrowthRate: 3.0,
        vacancyRate: 5.0,
        otherIncome: Math.round(purchasePrice * 0.002),
        
        // Expense assumptions (% of EGI)
        management: 6.0,
        maintenance: 8.0,
        utilities: 4.0,
        insurance: 2.5,
        propertyTaxes: 1.2,
        reserves: 5.0,
        
        // Financing assumptions
        loanToValue: 75.0,
        interestRate: 6.5,
        loanTerm: 30,
        
        // Market assumptions
        capRateExpansion: 0.25,
        exitCapRate: capRate + 0.25,
        holdPeriod: 5
      },
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
    
    // Generate Excel file
    await generateExcelFile(modelData);
      
    const fallbackMessage: Message = {
      role: 'assistant',
      content: `**Financial Model Generated for ${property.address}**\n\nAnalysis complete. This ${property.details.includes('unit') ? property.details.split('-')[0] + '-unit' : 'multifamily'} property shows strong fundamentals with a ${property.capRate} cap rate.\n\n**Key Highlights:**\n• NOI: $${noi.toLocaleString()}\n• Strong cash flow potential\n• Seattle market fundamentals support growth\n• Recommended for acquisition consideration\n\n📊 **Spreadsheet downloaded with detailed assumptions and 10-year projections**`,
      type: 'underwriting',
      data: modelData
    };
    
    setChatHistory(prev => [...prev, fallbackMessage]);
    
    setLoading(false);
  };

  const generateExcelFile = async (modelData: any) => {
    try {
      // Create Excel workbook using client-side Excel generation
      const workbookData = createFinancialModelWorkbook(modelData);
      
      // Create blob and download
      const blob = new Blob([workbookData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${modelData.address.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Model.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };

  const createFinancialModelWorkbook = (modelData: any) => {
    // For now, create a CSV-like content that can be opened in Excel
    // In a real implementation, you'd use a library like xlsx or exceljs
    const csvContent = generateCSVContent(modelData);
    return new TextEncoder().encode(csvContent);
  };

  const generateCSVContent = (modelData: any) => {
    const { property, assumptions, projections } = modelData;
    
    let csv = `REAL ESTATE FINANCIAL MODEL - ${property.address}\n\n`;
    
    // Property Information
    csv += `PROPERTY INFORMATION\n`;
    csv += `Address,${property.address}\n`;
    csv += `Location,${property.location}\n`;
    csv += `Price,${property.price}\n`;
    csv += `Cap Rate,${property.capRate}\n`;
    csv += `Property Type,${property.details}\n\n`;
    
    // Assumptions
    csv += `FINANCIAL ASSUMPTIONS\n`;
    csv += `Monthly Rent per Unit,$${assumptions.monthlyRentPerUnit}\n`;
    csv += `Rent Growth Rate,${assumptions.rentGrowthRate}%\n`;
    csv += `Vacancy Rate,${assumptions.vacancyRate}%\n`;
    csv += `Management Fee,${assumptions.management}%\n`;
    csv += `Maintenance,${assumptions.maintenance}%\n`;
    csv += `Insurance,${assumptions.insurance}%\n`;
    csv += `Property Taxes,${assumptions.propertyTaxes}%\n`;
    csv += `Loan to Value,${assumptions.loanToValue}%\n`;
    csv += `Interest Rate,${assumptions.interestRate}%\n`;
    csv += `Loan Term,${assumptions.loanTerm} years\n\n`;
    
    // 10-Year Projections
    csv += `10-YEAR CASH FLOW PROJECTIONS\n`;
    csv += `Year,Income,Expenses,NOI,Cash Flow\n`;
    projections.forEach((proj: any) => {
      csv += `${proj.year},$${proj.income.toLocaleString()},$${proj.expenses.toLocaleString()},$${proj.noi.toLocaleString()},$${proj.cashFlow.toLocaleString()}\n`;
    });
    
    return csv;
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-blue-50/30 to-white/90"></div>
        
        {/* Floating glass orbs with more realistic liquid glass effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/60 via-blue-100/40 to-white/70 rounded-full blur-2xl animate-float shadow-2xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-50/50 via-white/60 to-blue-100/40 rounded-full blur-2xl animate-float-delayed shadow-xl"></div>
        <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-gradient-to-br from-white/70 via-slate-100/30 to-white/60 rounded-full blur-xl animate-float-slow shadow-lg"></div>
        
        {/* Additional smaller glass particles */}
        <div className="absolute top-1/6 right-1/3 w-32 h-32 bg-white/40 rounded-full blur-lg animate-drift"></div>
        <div className="absolute bottom-1/6 left-1/3 w-24 h-24 bg-blue-50/50 rounded-full blur-md animate-drift-slow"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      <div className="relative z-10 min-h-screen">
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 relative">
                <button 
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  className="w-6 h-6 flex flex-col justify-center items-center space-y-1 hover:bg-gray-100/50 rounded p-1 transition-all duration-200"
                >
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                  <div className="w-4 h-0.5 bg-gray-700"></div>
                </button>
                
                {/* Workspace Menu Popup */}
                {workspaceMenuOpen && (
                  <div className="absolute top-8 left-0 mt-2 w-64 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/50 py-2 z-30">
                    <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-200/50">
                      Workspaces
                    </div>
                    {workspaces.map(workspace => (
                      <button
                        key={workspace.id}
                        onClick={() => handleWorkspaceSwitch(workspace.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100/50 transition-colors flex items-center justify-between ${
                          workspace.active ? 'bg-blue-50/50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span>{workspace.name}</span>
                        {workspace.active && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-gray-200/50 mt-2 pt-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100/50 transition-colors">
                        + New Workspace
                      </button>
                    </div>
                  </div>
                )}
                
                <span className="text-gray-900 font-medium">RETS</span>
                <span className="text-sm text-gray-600 bg-gray-100/80 px-2 py-1 rounded backdrop-blur-sm">v3</span>
              </div>
              <button className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Light</button>
            </div>
          </div>
          
          {/* Click outside to close menu */}
          {workspaceMenuOpen && (
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setWorkspaceMenuOpen(false)}
            ></div>
          )}
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
                <div className={`flex items-center bg-white/70 backdrop-blur-lg rounded-full shadow-2xl border px-4 py-3 transition-all duration-300 ${
                  chatFocused 
                    ? 'border-blue-400 bg-white/90 ring-2 ring-blue-200/50' 
                    : 'border-gray-200/50 hover:bg-white/80'
                }`}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setChatFocused(true)}
                    onBlur={() => setChatFocused(false)}
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
                <div className={`flex items-center bg-white/70 backdrop-blur-lg rounded-full shadow-2xl border px-4 py-3 transition-all duration-300 ${
                  chatFocused 
                    ? 'border-blue-400 bg-white/90 ring-2 ring-blue-200/50' 
                    : 'border-gray-200/50 hover:bg-white/80'
                }`}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setChatFocused(true)}
                    onBlur={() => setChatFocused(false)}
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