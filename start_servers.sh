#!/bin/bash

# RETS AI Development Server Setup Script
echo "Setting up RETS AI development servers..."

# Kill any existing processes on these ports
echo "Killing existing processes on ports 8000 and 3005..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true

# Backend setup
echo "Setting up backend..."
cd /Users/dylandahl/Desktop/rets/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Start backend server in background
echo "Starting backend server on port 8000..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Frontend setup
echo "Setting up frontend..."
cd /Users/dylandahl/Desktop/rets/frontend

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start frontend server in background
echo "Starting frontend server on port 3005..."
npm run dev &
FRONTEND_PID=$!

echo "Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access the application at: http://localhost:3005"
echo "Backend API at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop servers
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
wait