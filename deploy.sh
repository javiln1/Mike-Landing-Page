#!/bin/bash

# Funnel Template Deployment Script
# This script builds the template and provides deployment options

set -e

echo "🚀 Funnel Template Deployment Script"
echo "====================================="

# Check if config file is provided
if [ $# -eq 0 ]; then
    CONFIG_FILE="config/client-config.json"
    echo "📁 Using default config: $CONFIG_FILE"
else
    CONFIG_FILE="$1"
    echo "📁 Using config: $CONFIG_FILE"
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    echo "Available config files:"
    ls -la config/*.json 2>/dev/null || echo "  No config files found"
    exit 1
fi

# Build the template
echo "🔨 Building template..."
python3 build-template.py "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if output directory exists and has files
if [ -d "output" ] && [ "$(ls -A output)" ]; then
    echo "📂 Output directory ready: $(pwd)/output"
    echo "📄 Generated files:"
    ls -la output/
else
    echo "❌ No output files generated"
    exit 1
fi

# Deployment options
echo ""
echo "🌐 Deployment Options:"
echo "====================="
echo "1. Preview locally:"
echo "   python3 -m http.server 8000 -d output"
echo "   Then open: http://localhost:8000"
echo ""
echo "2. Deploy to Vercel:"
echo "   - Connect your GitHub repo to Vercel"
echo "   - Set build command: python3 build-template.py"
echo "   - Set output directory: output"
echo "   - Deploy!"
echo ""
echo "3. Deploy to Netlify:"
echo "   - Connect your GitHub repo to Netlify"
echo "   - Set build command: python3 build-template.py"
echo "   - Set publish directory: output"
echo "   - Deploy!"
echo ""
echo "4. Manual upload:"
echo "   - Upload contents of 'output' folder to your web server"
echo "   - Update form action URLs in the generated HTML"
echo ""

# Ask if user wants to preview
read -p "Would you like to preview the site now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting local server..."
    echo "Open http://localhost:8000 in your browser"
    echo "Press Ctrl+C to stop the server"
    python3 -m http.server 8000 -d output
fi

echo "✨ Deployment script complete!"
