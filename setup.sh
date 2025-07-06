#!/bin/bash

echo "🚀 Setting up Steganography Web Application..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python v3.7 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
DB_USER=your_db_username
DB_HOST=localhost
DB_NAME=steganography_db
DB_PASSWORD=your_db_password
DB_PORT=5432
EOF
    echo "⚠️  Please update the .env file with your database credentials!"
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. Set up PostgreSQL database and create the users table"
echo "3. Start the server with: node server.js"
echo "4. Open index.html in your web browser"
echo ""
echo "📖 For detailed instructions, see README.md" 