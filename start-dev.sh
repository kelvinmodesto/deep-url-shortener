#!/bin/bash

# URL Shortener Development Server Startup Script
# This script starts both the API server and the client development server

echo "🚀 Starting URL Shortener Development Environment"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo -e "${RED}❌ Error: Please run this script from the url-shortener root directory${NC}"
    echo -e "${YELLOW}Expected structure:${NC}"
    echo "  url-shortener/"
    echo "  ├── server/"
    echo "  ├── client/"
    echo "  └── start-dev.sh"
    exit 1
fi

# Install dependencies if node_modules don't exist
echo -e "${BLUE}Checking dependencies...${NC}"

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    cd server && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install server dependencies${NC}"
        exit 1
    fi
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
    cd client && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install client dependencies${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Start MongoDB if not running (optional check)
echo -e "${BLUE}Checking MongoDB connection...${NC}"
if command_exists mongosh; then
    mongosh --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB may not be running. The app will use in-memory database for tests.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB client not found. The app will use in-memory database for tests.${NC}"
fi

echo ""

# Start the API server
echo -e "${BLUE}🔧 Starting API server on http://localhost:3000...${NC}"
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Check if server started successfully
curl -s http://localhost:3000/ping >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API server started successfully${NC}"
else
    echo -e "${YELLOW}⚠️  API server may still be starting...${NC}"
fi

echo ""

# Start the client
echo -e "${BLUE}🎨 Starting client development server on http://localhost:5173...${NC}"
cd client
npm run dev &
CLIENT_PID=$!
cd ..

# Wait a moment for client to start
sleep 3

echo ""
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo "================================================="
echo -e "📡 API Server:    ${BLUE}http://localhost:3000${NC}"
echo -e "🎨 Client App:    ${BLUE}http://localhost:5173${NC}"
echo -e "📚 API Docs:      ${BLUE}http://localhost:3000/info${NC}"
echo -e "🔍 Health Check:  ${BLUE}http://localhost:3000/ping${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
