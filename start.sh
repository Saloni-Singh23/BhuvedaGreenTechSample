#!/bin/bash
# Bhuveda GreenTech - Quick Start Script for Linux/Mac

echo ""
echo "========================================"
echo "  Bhuveda GreenTech - Development Server"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "Starting server on http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
npm start
