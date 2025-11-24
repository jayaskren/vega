#!/bin/bash
# Simple HTTP server for testing Neutrino demos
# This is needed because WASM files cannot be loaded via file:// protocol

PORT=${1:-8000}

echo "=========================================="
echo "Starting HTTP server for Neutrino demos"
echo "=========================================="
echo ""
echo "Server will run on: http://localhost:$PORT"
echo ""
echo "Open these URLs in your browser:"
echo "  - Comparison Demo: http://localhost:$PORT/examples/neutrino-comparison.html"
echo "  - Standalone Demo: http://localhost:$PORT/examples/neutrino-standalone-demo.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

# Try different server options in order of preference
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    cd "$(dirname "$0")/.." && python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    cd "$(dirname "$0")/.." && python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo "Using npx http-server..."
    cd "$(dirname "$0")/.." && npx http-server -p $PORT
else
    echo "ERROR: No HTTP server found!"
    echo "Please install one of:"
    echo "  - Python 3: sudo apt install python3"
    echo "  - Node.js: sudo apt install nodejs npm"
    exit 1
fi

