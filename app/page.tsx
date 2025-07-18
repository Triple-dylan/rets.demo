'use client';

import React, { useState } from 'react';

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
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Persist theme preference
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Load theme preference on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    }
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: 'Seattle Properties', active: true },
    { id: 2, name: 'San Diego', active: false },
    { id: 3, name: 'Analysis Draft', active: false }
  ]);
  const [chatFocused, setChatFocused] = useState(false);

  const handleWorkspaceSwitch = (workspaceId: number) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      active: ws.id === workspaceId
    })));
    setSidebarOpen(false);
    // In a real app, this would also change the context/data for the workspace
  };

  const handleNewWorkspace = () => {
    const newId = Math.max(...workspaces.map(ws => ws.id)) + 1;
    const newWorkspace = {
      id: newId,
      name: `Workspace ${newId}`,
      active: false
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
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
      content: `Financial model generated and downloaded for ${property.address}`,
      type: 'underwriting',
      data: modelData
    };
    
    setChatHistory(prev => [...prev, fallbackMessage]);
    
    setLoading(false);
  };

  const generateExcelFile = async (modelData: any) => {
    try {
      // Create CSV content that opens properly in Excel
      const csvContent = generateCSVContent(modelData);
      
      // Create blob with proper CSV mime type
      const blob = new Blob([csvContent], { 
        type: 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${modelData.address.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Model.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };

  const generateCSVContent = (modelData: any) => {
    const { property, assumptions, projections } = modelData;
    
    let csv = `"REAL ESTATE FINANCIAL MODEL - ${property.address}"\n\n`;
    
    // Property Information
    csv += `"PROPERTY INFORMATION"\n`;
    csv += `"Address","${property.address}"\n`;
    csv += `"Location","${property.location}"\n`;
    csv += `"Price","${property.price}"\n`;
    csv += `"Cap Rate","${property.capRate}"\n`;
    csv += `"Property Type","${property.details}"\n\n`;
    
    // Assumptions
    csv += `"FINANCIAL ASSUMPTIONS"\n`;
    csv += `"Monthly Rent per Unit","$${assumptions.monthlyRentPerUnit}"\n`;
    csv += `"Rent Growth Rate","${assumptions.rentGrowthRate}%"\n`;
    csv += `"Vacancy Rate","${assumptions.vacancyRate}%"\n`;
    csv += `"Management Fee","${assumptions.management}%"\n`;
    csv += `"Maintenance","${assumptions.maintenance}%"\n`;
    csv += `"Insurance","${assumptions.insurance}%"\n`;
    csv += `"Property Taxes","${assumptions.propertyTaxes}%"\n`;
    csv += `"Loan to Value","${assumptions.loanToValue}%"\n`;
    csv += `"Interest Rate","${assumptions.interestRate}%"\n`;
    csv += `"Loan Term","${assumptions.loanTerm} years"\n\n`;
    
    // 10-Year Projections
    csv += `"10-YEAR CASH FLOW PROJECTIONS"\n`;
    csv += `"Year","Income","Expenses","NOI","Cash Flow"\n`;
    projections.forEach((proj: any) => {
      csv += `"${proj.year}","$${proj.income.toLocaleString()}","$${proj.expenses.toLocaleString()}","$${proj.noi.toLocaleString()}","$${proj.cashFlow.toLocaleString()}"\n`;
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
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`fixed inset-0 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-white'
      }`}>
        <div className={`absolute inset-0 transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-tr from-gray-800/95 via-gray-700/30 to-gray-800/90'
            : 'bg-white'
        }`}></div>
        
        {/* Keep floating effects only for dark mode */}
        {darkMode && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-700/60 via-gray-600/40 to-gray-700/70 rounded-full blur-2xl animate-float shadow-2xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tl from-gray-600/50 via-gray-700/60 to-gray-600/40 rounded-full blur-2xl animate-float-delayed shadow-xl"></div>
            <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-gradient-to-br from-gray-700/70 via-gray-800/30 to-gray-700/60 rounded-full blur-xl animate-float-slow shadow-lg"></div>
            <div className="absolute top-1/6 right-1/3 w-32 h-32 bg-gray-700/40 rounded-full blur-lg animate-drift"></div>
            <div className="absolute bottom-1/6 left-1/3 w-24 h-24 bg-gray-600/50 rounded-full blur-md animate-drift-slow"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          </>
        )}
      </div>
      
      {/* Left sidebar trigger bar */}
      <div className={`fixed left-0 top-0 h-full w-1 z-30 transition-colors duration-300 ${
        darkMode ? 'bg-gray-700/20' : 'bg-gray-200/30'
      }`}></div>
      
      {/* Hamburger button in far left corner */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className={`fixed left-2 top-4 z-30 w-8 h-8 flex flex-col justify-center items-center space-y-1 rounded-lg transition-all duration-200 ${
          darkMode ? 'hover:bg-gray-800/80 bg-gray-900/50' : 'hover:bg-white/80 bg-white/50'
        } backdrop-blur-sm shadow-lg`}
      >
        <div className={`w-4 h-0.5 transition-colors duration-300 ${
          darkMode ? 'bg-gray-300' : 'bg-gray-700'
        }`}></div>
        <div className={`w-4 h-0.5 transition-colors duration-300 ${
          darkMode ? 'bg-gray-300' : 'bg-gray-700'
        }`}></div>
        <div className={`w-4 h-0.5 transition-colors duration-300 ${
          darkMode ? 'bg-gray-300' : 'bg-gray-700'
        }`}></div>
      </button>

      {/* Vertical line next to sidebar toggle */}
      <div className={`fixed left-12 top-0 h-full w-px z-20 transition-colors duration-300 ${
        darkMode ? 'bg-gray-700/50' : 'bg-gray-200/20'
      }`}></div>

      <div className="relative z-10 min-h-screen">
        <header className={`border-b sticky top-0 z-20 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700/50 backdrop-blur-md' 
            : 'bg-white border-gray-200/20'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 ml-8">
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>RETS</span>
                <span className={`text-sm px-2 py-1 rounded backdrop-blur-sm transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-400 bg-gray-700/80' 
                    : 'text-gray-600 bg-gray-100/80'
                }`}>o3</span>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`text-sm transition-colors px-3 py-1 rounded-md ${
                  darkMode 
                    ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* Slide-out Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-full">
            <div className={`flex flex-col w-full backdrop-blur-lg border-r shadow-xl transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800/95 border-gray-700/50' 
                : 'bg-white/95 border-gray-200/50'
            }`}>
              {/* Sidebar Header */}
              <div className={`flex items-center justify-end p-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
              }`}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Workspace List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {workspaces.map(workspace => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSwitch(workspace.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${
                        workspace.active 
                          ? darkMode
                            ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : darkMode
                            ? 'hover:bg-gray-700/50 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className={`text-sm mt-1 transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {workspace.active ? 'Current workspace' : 'Switch to this workspace'}
                        </div>
                      </div>
                      {workspace.active && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Add New Workspace */}
                <div className={`p-4 border-t transition-colors duration-300 ${
                  darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <button 
                    onClick={handleNewWorkspace}
                    className={`w-full text-left p-3 rounded-lg transition-colors border-2 border-dashed ${
                      darkMode 
                        ? 'hover:bg-gray-700/50 text-gray-400 border-gray-600 hover:border-gray-500' 
                        : 'hover:bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors duration-300 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-medium">New Workspace</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="max-w-5xl mx-auto px-6">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">              
              <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                  <h1 className={`text-3xl font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Who needs manual processes? Ask RETS instead.
                  </h1>
                </div>
                <div className={`flex items-center rounded-full px-4 py-3 transition-all duration-300 ${
                  darkMode 
                    ? chatFocused 
                      ? 'bg-gray-800 border border-blue-400 ring-2 ring-blue-400/50' 
                      : 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
                    : chatFocused 
                      ? 'bg-gray-100 border border-blue-400 ring-2 ring-blue-200/50' 
                      : 'bg-gray-100 border border-gray-200 hover:bg-gray-50'
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`mr-3 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setChatFocused(true)}
                    onBlur={() => setChatFocused(false)}
                    placeholder="Ask RETS to do anything"
                    className={`flex-1 outline-none bg-transparent transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-100 placeholder-gray-400' 
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
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
                <div className={`text-sm mt-2 text-center transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>RETS.ai can make mistakes. Verify for accuracy.</div>
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
                        <div className={`px-4 py-2 rounded-lg max-w-2xl border transition-colors duration-300 ${
                          darkMode 
                            ? 'bg-gray-800 text-gray-100 border-gray-700' 
                            : 'bg-gray-100 text-gray-900 border-gray-200'
                        }`}>
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
                        
                        {msg.type === 'underwriting' && msg.data && (
                          <div className={`border rounded-lg p-6 mb-6 transition-colors duration-300 ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                                darkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                Financial Model - {msg.data.address}
                              </h3>
                              <div className={`text-sm px-3 py-1 rounded-full transition-colors duration-300 ${
                                darkMode 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Downloaded
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className={`text-sm transition-colors duration-300 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Purchase Price</div>
                                <div className={`text-lg font-bold transition-colors duration-300 ${
                                  darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>{msg.data.price}</div>
                              </div>
                              <div>
                                <div className={`text-sm transition-colors duration-300 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Cap Rate</div>
                                <div className={`text-lg font-bold transition-colors duration-300 ${
                                  darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>{msg.data.capRate}</div>
                              </div>
                              <div>
                                <div className={`text-sm transition-colors duration-300 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>NOI</div>
                                <div className={`text-lg font-bold transition-colors duration-300 ${
                                  darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>${msg.data.noi.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className={`text-sm transition-colors duration-300 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Cash Flow</div>
                                <div className={`text-lg font-bold transition-colors duration-300 ${
                                  darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>${msg.data.cashFlow.toLocaleString()}</div>
                              </div>
                            </div>

                            <div className={`text-sm transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Detailed financial model with 10-year projections and market assumptions has been downloaded to your computer.
                            </div>
                          </div>
                        )}
                        
                        <div className={`transition-colors duration-300 ${
                          darkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>{msg.content}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start mb-4 max-w-4xl mx-auto">
                    <div className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-100 border-gray-700' 
                        : 'bg-gray-100 text-gray-900 border-gray-200'
                    }`}>
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
                <div className={`flex items-center rounded-full px-4 py-3 transition-all duration-300 ${
                  darkMode 
                    ? chatFocused 
                      ? 'bg-gray-800 border border-blue-400 ring-2 ring-blue-400/50' 
                      : 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
                    : chatFocused 
                      ? 'bg-gray-100 border border-blue-400 ring-2 ring-blue-200/50' 
                      : 'bg-gray-100 border border-gray-200 hover:bg-gray-50'
                }`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`mr-3 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setChatFocused(true)}
                    onBlur={() => setChatFocused(false)}
                    placeholder="Message RETS"
                    className={`flex-1 outline-none bg-transparent transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-100 placeholder-gray-400' 
                        : 'text-gray-900 placeholder-gray-500'
                    }`}
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