#!/bin/bash

# DUAL-AI ORCHESTRATOR PLATFORM - QUICK START SCRIPT
# Optimized for macOS - NO DOCKER required

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
WS_PORT=3002

# Banner
echo -e "${PURPLE}"
echo "┌──────────────────────────────────────────────────────────────────────────────┐"
echo "│                    🤖 DUAL-AI ORCHESTRATOR PLATFORM 🤖                     │"
echo "│                              Quick Start Script                              │"
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
        echo -e "${YELLOW}📝 Please edit .env with your API keys before starting!${NC}"
        echo -e "${CYAN}   - OPENAI_API_KEY=sk-your-openai-key-here${NC}"
        echo -e "${CYAN}   - ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here${NC}"
        echo
        read -p "Press Enter after configuring your API keys..."
    else
        echo -e "${RED}❌ .env.example not found! Please run setup first.${NC}"
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    cd "$PROJECT_DIR"
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Start the server
echo -e "${BLUE}🚀 Starting Dual-AI Orchestrator Platform...${NC}"
cd "$PROJECT_DIR"

# Set memory optimization for macOS
export NODE_OPTIONS="--max-old-space-size=2048"

# Start server
echo -e "${CYAN}📡 Starting server...${NC}"
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Server started successfully!${NC}"
    echo
    echo -e "${CYAN}🌐 Web Interface:${NC} http://localhost:$PORT"
    echo -e "${CYAN}🔗 WebSocket:${NC} ws://localhost:$WS_PORT"
    echo -e "${CYAN}📊 Health Check:${NC} http://localhost:$PORT/health"
    echo -e "${CYAN}📈 Statistics:${NC} http://localhost:$PORT/api/stats"
    echo
    echo -e "${GREEN}🎉 Ready to collaborate with AI!${NC}"
    echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
    echo
    
    # Keep script running and handle Ctrl+C
    trap 'echo -e "\n${YELLOW}⏹️  Stopping server...$NC"; kill $SERVER_PID 2>/dev/null; exit 0' INT
    
    # Wait for server to exit
    wait $SERVER_PID
else
    echo -e "${RED}❌ Failed to start server${NC}"
    echo -e "${YELLOW}📋 Check the logs for more information${NC}"
    exit 1
fi