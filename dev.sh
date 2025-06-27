#!/bin/bash

# DUAL-AI ORCHESTRATOR PLATFORM - DEVELOPMENT SCRIPT
# Auto-restart development server with nodemon
# macOS optimized

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3001

# Banner
echo -e "${PURPLE}"
echo "┌──────────────────────────────────────────────────────────────────────────────┐"
echo "│                    🤖 DUAL-AI ORCHESTRATOR PLATFORM 🤖                     │"
echo "│                            Development Mode                                  │"
echo "└──────────────────────────────────────────────────────────────────────────────┘"
echo -e "${NC}"

# Check if .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Environment file not found!${NC}"
    
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        echo -e "${BLUE}ℹ️  Creating .env from template...${NC}"
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        chmod 600 "$PROJECT_DIR/.env"
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}📝 Please edit .env with your API keys!${NC}"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
fi

# Check dependencies
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    cd "$PROJECT_DIR"
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if nodemon is available
if ! npm list nodemon > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  nodemon not found, installing...${NC}"
    npm install --save-dev nodemon
    echo -e "${GREEN}✅ nodemon installed${NC}"
fi

# Start development server
echo -e "${BLUE}🚀 Starting development server with auto-restart...${NC}"
echo -e "${CYAN}📡 Server will start on: http://localhost:$PORT${NC}"
echo -e "${YELLOW}🔄 Auto-restart enabled - files will be watched for changes${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop the development server${NC}"
echo

cd "$PROJECT_DIR"

# Set environment variables for development
export NODE_ENV=development
export NODE_OPTIONS="--max-old-space-size=2048"

# Start with nodemon
npx nodemon backend/server.js