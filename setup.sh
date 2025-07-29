#!/bin/bash

# Development setup script for Orshot CLI

echo "🚀 Setting up Orshot CLI for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make CLI executable
echo "🔧 Making CLI executable..."
chmod +x bin/orshot.js
chmod +x examples/usage.js

# Test CLI
echo "🧪 Testing CLI..."
node bin/orshot.js --version

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test the CLI: ./bin/orshot.js --help"
echo "   2. Login with API key: ./bin/orshot.js auth login <your-api-key>"
echo "   3. List templates: ./bin/orshot.js templates library"
echo "   4. Generate image: ./bin/orshot.js generate library <template-id>"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Usage guide"
echo "   - CONTRIBUTING.md - Development guide"
echo "   - examples/usage.js - Example usage script"
echo ""
echo "🎉 Happy coding!"
