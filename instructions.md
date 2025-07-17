RETS.ai Development Instructions for Cursor & Claude Code
Project Setup & Architecture
1. Initialize Project Structure
bashnpx create-react-app rets-ai --template typescript
cd rets-ai
npm install @types/node @types/react @types/react-dom
npm install tailwindcss postcss autoprefixer
npm install lucide-react recharts
npm install axios react-router-dom
npm install jspdf html2canvas
2. Project Directory Structure
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyDetails.tsx
│   │   └── PropertyFilters.tsx
│   ├── underwriting/
│   │   ├── UnderwritingModel.tsx
│   │   ├── FinancialChart.tsx
│   │   └── MetricsSummary.tsx
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── SearchBar.tsx
│   │   └── QueryProcessor.tsx
│   └── documents/
│       ├── DocumentGenerator.tsx
│       ├── LOITemplate.tsx
│       └── PDFExport.tsx
├── data/
│   ├── mockProperties.ts
│   ├── financialTemplates.ts
│   └── documentTemplates.ts
├── services/
│   ├── api.ts
│   ├── aiService.ts
│   ├── underwritingService.ts
│   └── documentService.ts
├── utils/
│   ├── calculations.ts
│   ├── formatters.ts
│   └── constants.ts
├── types/
│   ├── property.ts
│   ├── financial.ts
│   └── user.ts
├── hooks/
│   ├── useProperties.ts
│   ├── useSearch.ts
│   └── useUnderwriting.ts
└── pages/
    ├── Dashboard.tsx
    ├── PropertyDetails.tsx
    ├── Underwriting.tsx
    └── Documents.tsx
Core Implementation Guidelines
3. Design System & Styling
Color Palette (based on screenshots):
css/* Primary Colors */
--primary-blue: #2563eb;
--primary-dark: #1e3a8a;
--background: #f8fafc;
--card-background: #ffffff;
--text-primary: #1f2937;
--text-secondary: #6b7280;
--border: #e5e7eb;
Component Standards:

Use Tailwind CSS for all styling
Implement consistent border radius (8px for cards, 6px for buttons)
Maintain consistent spacing using Tailwind's spacing scale
Use shadow-sm for cards, shadow-md for modals

4. Property Card Component Requirements
tsxinterface PropertyCardProps {
  property: Property;
  onViewDetails: (id: string) => void;
  onViewModel: (id: string) => void;
}

// Features to implement:
// - High-quality image with aspect ratio 16:10
// - Price in large, bold text ($X,XXX,XXX format)
// - Address with proper formatting
// - Property type and unit count
// - Cap rate with percentage
// - Hover effects and smooth transitions
// - Action buttons: "View Model" and "Abstract OIM"
5. Search Interface Implementation
Natural Language Processing:
tsx// Implement pattern matching for common queries:
const searchPatterns = {
  priceRange: /\$(\d+(?:\.\d+)?)[kmKM]?\s*[-to]\s*\$?(\d+(?:\.\d+)?)[kmKM]?/,
  capRate: /cap\s+rate.*?(\d+(?:\.\d+)?)%?\s*[-to]\s*(\d+(?:\.\d+)?)%?/,
  location: /(in|near|around)\s+([a-zA-Z\s]+)/,
  units: /(\d+)\s*[-to]\s*(\d+)\s*units?/
};

// Convert natural language to filters
const parseSearchQuery = (query: string) => {
  // Implementation for extracting search criteria
};
6. Mock Data Implementation
Property Data Structure:
typescriptinterface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  units: number;
  capRate: number;
  images: string[];
  propertyType: 'Apartment' | 'Office' | 'Retail' | 'Industrial';
  squareFootage: number;
  yearBuilt: number;
  financialMetrics: {
    noi: number;
    grossIncome: number;
    expenses: number;
    totalReturn: number;
  };
}

// Generate 20-30 realistic Seattle properties
// Price range: $4M - $8M
// Cap rates: 3.5% - 6.5%
// Various property types and locations
7. Underwriting Model Implementation
Financial Calculations:
typescriptinterface UnderwritingModel {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  grossIncome: number;
  expenses: number;
  noi: number;
  capRate: number;
  cashOnCash: number;
  totalReturn: number;
}

// Implement spreadsheet-like interface
// Include 10-year projection
// Interactive charts using Recharts
// Real-time calculation updates
8. Document Generation System
LOI Template Structure:
typescriptinterface LOIData {
  propertyAddress: string;
  purchasePrice: number;
  earnestMoney: number;
  inspectionPeriod: number;
  closingDate: string;
  financingTerms: string;
  buyerName: string;
  additionalTerms: string[];
}

// Use jsPDF for PDF generation
// Include professional formatting
// Company letterhead and branding
// Digital signature areas
9. AI Chat Interface
Implementation Requirements:
tsx// Use React state for conversation history
// Implement typing indicators
// Handle voice input (future feature)
// Context-aware responses
// Integration with property search
// Smooth scrolling and animations

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    properties?: Property[];
    action?: string;
  };
}
10. Responsive Design Requirements
Breakpoints:

Mobile: 640px and below (1 column grid)
Tablet: 641px - 1024px (2 column grid)
Desktop: 1025px+ (3 column grid)

Key Responsive Features:

Collapsible sidebar on mobile
Stack property cards vertically on small screens
Adjust font sizes and spacing
Touch-friendly button sizes (minimum 44px)

Technical Implementation Details
11. State Management
typescript// Use React Context for global state
interface AppState {
  properties: Property[];
  filters: SearchFilters;
  selectedProperty: Property | null;
  searchQuery: string;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Implement custom hooks for data fetching
// Handle loading states and error boundaries
// Optimize re-renders with useMemo and useCallback
12. Performance Optimization
Key Strategies:

Implement virtual scrolling for large property lists
Lazy load property images
Debounce search input (300ms)
Memoize expensive calculations
Code splitting by route
Optimize bundle size with tree shaking

13. Testing Strategy
Component Testing:
bashnpm install @testing-library/react @testing-library/jest-dom
npm install @testing-library/user-event

# Test coverage requirements:
# - Property card rendering and interactions
# - Search functionality
# - Financial calculations
# - Document generation
# - Responsive behavior
14. Build Configuration
Tailwind CSS Setup:
javascript// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
15. Deployment Instructions
Build Process:
bash# Production build
npm run build

# Serve locally for testing
npx serve -s build

# Environment variables
REACT_APP_API_URL=your_api_url
REACT_APP_OPENAI_API_KEY=your_openai_key
Development Priorities
Phase 1: Core UI (Week 1-2)

Set up project structure and Tailwind
Implement Header and Layout components
Create PropertyCard and PropertyGrid
Add basic search and filtering
Implement responsive design

Phase 2: Business Logic (Week 3-4)

Add mock data and property service
Implement underwriting calculations
Create financial modeling interface
Add property details view
Basic document generation

Phase 3: AI Features (Week 5-6)

Implement chat interface
Add natural language search processing
Create conversational property recommendations
Integrate with external AI APIs (mock for demo)
Polish user experience

Phase 4: Advanced Features (Week 7-8)

Complete document generation system
Add PDF export functionality
Implement advanced filtering
Performance optimization
Final testing and polish

Key Success Criteria

Visual Fidelity: Match the clean, professional design from screenshots
Responsive Design: Works perfectly on all device sizes
Performance: Fast loading and smooth interactions
User Experience: Intuitive navigation and clear information hierarchy
Data Accuracy: Realistic property data and financial calculations
AI Integration: Smooth conversational interface with contextual responses

Additional Notes

Prioritize code quality and maintainability
Use TypeScript throughout for type safety
Implement proper error handling and loading states
Follow React best practices and hooks patterns
Ensure accessibility with proper ARIA labels
Use semantic HTML elements
Implement proper SEO meta tags
Consider future scalability in architectural decisions

screenshots of the demo are found under the folder 'inspo-screenshots' titled retsai followed by a number in chronological order of the workflow. 

OpenAI API key configured in environment variables