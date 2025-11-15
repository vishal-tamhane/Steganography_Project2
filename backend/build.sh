#!/usr/bin/env bash
# Build script for Render

echo "Installing Node.js dependencies..."
npm install

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete!"
