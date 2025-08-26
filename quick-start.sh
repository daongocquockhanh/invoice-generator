#!/bin/bash

echo "🚀 Invoice Generator Web App - Quick Start"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🔧 Setting up environment variables..."

# Create backend .env file
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please update backend/.env with your configuration"
else
    echo "✅ Backend .env file already exists"
fi

# Create frontend .env.local file
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/env.example frontend/.env.local
    echo "⚠️  Please update frontend/.env.local with your configuration"
else
    echo "✅ Frontend .env.local file already exists"
fi

echo ""
echo "🗄️  Setting up database..."

# Generate Prisma client
cd backend
npx prisma generate
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Update frontend/.env.local with your configuration"
echo "3. Run 'npm run dev' to start both services"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start both frontend and backend in development mode"
echo "  npm run dev:backend  - Start only backend"
echo "  npm run dev:frontend - Start only frontend"
echo "  npm run build        - Build frontend for production"
echo "  npm run start        - Start backend in production mode"
echo ""
echo "🐳 Docker commands:"
echo "  docker-compose up --build  - Start with Docker"
echo "  docker-compose down        - Stop Docker services"
echo ""
echo "Happy coding! 🚀"
