#!/bin/bash

# Domy v Itálii - Local Development Setup Script
# This script helps you set up the project for local development

echo "🏠 Setting up Domy v Itálii for local development..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -f "yarn.lock" ]; then
    echo "Using Yarn..."
    yarn install
else
    echo "Using npm..."
    npm install
fi

# Copy environment template
echo ""
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp env.template .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  Please edit .env.local with your actual values before running the app"
else
    echo "ℹ️  .env.local already exists"
fi

# Check for required environment variables
echo ""
echo "🔍 Checking environment setup..."
if grep -q "your_supabase_project_url" .env.local 2>/dev/null; then
    echo "⚠️  Please update your Supabase credentials in .env.local"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run the database setup scripts in Supabase:"
echo "   - setup-database-fixed.sql"
echo "   - setup-email-notifications.sql"
echo "3. Start the development server: npm run dev"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo "🚀 Happy coding!"
