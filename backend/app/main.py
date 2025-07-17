from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Import routers
from app.routers import chat, properties, documents

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting RETS AI Backend...")
    
    # Startup logic
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not set - AI features will not work")
    
    yield
    
    # Shutdown logic
    logger.info("Shutting down RETS AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="RETS AI Backend",
    description="Real Estate AI Assistant Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
if isinstance(cors_origins, str):
    import json
    cors_origins = json.loads(cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(properties.router, prefix="/api/properties", tags=["properties"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RETS AI Backend API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )