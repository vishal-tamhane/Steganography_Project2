@echo off
echo 🚀 Setting up Steganography Web Application...
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python v3.7 or higher.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Install Python dependencies
echo 🐍 Installing Python dependencies...
call pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist uploads mkdir uploads

REM Create .env file if it doesn't exist
if not exist .env (
    echo 🔧 Creating .env file...
    (
        echo JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
        echo DB_USER=your_db_username
        echo DB_HOST=localhost
        echo DB_NAME=steganography_db
        echo DB_PASSWORD=your_db_password
        echo DB_PORT=5432
    ) > .env
    echo ⚠️  Please update the .env file with your database credentials!
)

echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update the .env file with your database credentials
echo 2. Set up PostgreSQL database and create the users table
echo 3. Start the server with: node server.js
echo 4. Open index.html in your web browser
echo.
echo 📖 For detailed instructions, see README.md
pause 