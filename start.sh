#!/bin/bash

# Deep Research Assistant Startup Script
# Starts server first, then UI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for server to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port 4112; then
            print_success "Server is ready on port 4112!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Server failed to start within 60 seconds"
    return 1
}

# Function to cleanup background processes
cleanup() {
    print_warning "Shutting down services..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$UI_PID" ]; then
        kill $UI_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if required directories exist
if [ ! -d "server" ]; then
    print_error "Server directory not found!"
    exit 1
fi

if [ ! -d "ui" ]; then
    print_error "UI directory not found!"
    exit 1
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    print_warning "Server .env file not found. Make sure to copy .env.example to .env and configure it."
fi

print_status "Starting Deep Research Assistant..."
print_status "=================================="

# Start the server
print_status "Starting Mastra server..."
cd server
yarn dev &
SERVER_PID=$!
cd ..

# Wait for server to be ready
if ! wait_for_server; then
    cleanup
    exit 1
fi

# Start the UI
print_status "Starting Next.js UI..."
cd ui
yarn dev &
UI_PID=$!
cd ..

print_success "Both services started successfully!"
print_status "=================================="
print_status "Server: http://localhost:4112"
print_status "UI: http://localhost:3000"
print_status "=================================="
print_status "Press Ctrl+C to stop both services"

# Wait for background processes
wait