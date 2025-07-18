# RETS AI - Real Estate processes neural layer.

A modern real estate AI agent built with Python backend and Next.js frontend for property search, workflow systems, and investment analysis.

## 🏗️ Architecture

- **Backend**: Python FastAPI with OpenAI integration
- **Frontend**: Next.js with TypeScript for exact UI match
- **AI/ML**: Python-based OpenAI integration, RAG, and document generation
- **Documents**: Excel underwriting analysis + PDF LOI generation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key

### 1. Environment Setup

```bash
# Backend environment
cp backend/.env.example backend/.env
# Add your OpenAI API key to backend/.env
```

### 2. Run with Docker (Recommended)

```bash
# Start both services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### 3. Run Manually

**Backend (Terminal 1):**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Features

### ✅ Implemented
- **Natural Language Property Search**: "Find properties in Seattle $5-7M, 4-6% cap rate"
- **AI Chat Interface**: OpenAI-powered conversation
- **Property Display**: Card grid matching demo design
- **Excel Underwriting**: Comprehensive financial analysis
- **PDF LOI Generation**: Professional letter of intent
- **Exact UI Match**: Pixel-perfect recreation of demo

### 🔄 Architecture Benefits
- **Python AI/ML**: All AI, RAG, and ML in Python ecosystem
- **Scalable Backend**: FastAPI for high-performance APIs
- **Modern Frontend**: Next.js for exact UI requirements
- **Easy Deployment**: Docker containers for both services

## 📁 Project Structure

```
rets-ai/
├── backend/           # Python FastAPI backend
│   ├── app/          # FastAPI application
│   ├── services/     # AI, property, document services
│   ├── models/       # Pydantic data models
│   ├── utils/        # Excel/PDF generators
│   └── data/         # Mock property data
├── frontend/         # Next.js frontend
│   ├── src/          # React components
│   ├── components/   # UI components
│   └── services/     # API communication
└── docker-compose.yml
```

## 🔧 Development

### Backend API Endpoints
- `POST /api/chat/` - Process chat messages
- `GET /api/properties/search` - Search properties
- `POST /api/documents/generate` - Generate documents
- `GET /api/documents/download` - Download documents

### Frontend Features
- **Chat Interface**: Real-time conversation with AI
- **Property Search**: Visual property cards
- **Document Generation**: In-browser preview + download
- **Responsive Design**: Mobile-friendly layout

## 🧪 Testing

```bash
# Test backend
cd backend
python -m pytest

# Test frontend
cd frontend
npm test

# Test full integration
curl http://localhost:8000/health
curl http://localhost:3000
```

## 📦 Deployment

### Production Ready
- **Backend**: Deploy FastAPI to any Python hosting (Railway, Render, AWS)
- **Frontend**: Deploy Next.js to Vercel, Netlify, or any static host
- **Environment**: Update API URLs in production config

### Environment Variables
```bash
# Backend (.env)
OPENAI_API_KEY=your_key_here
ENVIRONMENT=production
CORS_ORIGINS=["https://your-frontend-domain.com"]

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 🎨 UI Components

All components match the exact design from demo screenshots:
- Purple/blue color scheme
- Rounded input fields
- Property card layouts
- Document generation UI
- Chat bubbles and animations

## 🔄 Future Enhancements

1. **RAG Implementation**: Vector database for property knowledge
2. **Real Data Integration**: Replace mock data with live APIs
3. **User Authentication**: Multi-tenant support
4. **Advanced Analytics**: ML models for property valuation
5. **Mobile App**: React Native version

---

**Ready to run!** Start with `docker-compose up` and visit http://localhost:3000# rets.demo
