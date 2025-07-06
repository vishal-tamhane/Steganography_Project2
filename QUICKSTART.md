# Quick Start Guide

Get your steganography application running in 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites (Install these first)
- [Node.js](https://nodejs.org/) (v14+)
- [Python](https://python.org/) (v3.7+)
- [PostgreSQL](https://postgresql.org/) (v12+)

### 2. Automated Setup

**Windows:**
```cmd
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup (if automated fails)

```bash
# Install dependencies
cd backend
npm install
pip install -r requirements.txt

# Create uploads directory
mkdir uploads

# Create .env file
echo "JWT_SECRET=your_secret_key_here" > .env
echo "DB_USER=your_username" >> .env
echo "DB_HOST=localhost" >> .env
echo "DB_NAME=steganography_db" >> .env
echo "DB_PASSWORD=your_password" >> .env
echo "DB_PORT=5432" >> .env
```

### 4. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE steganography_db;
\c steganography_db

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start the Application

```bash
cd backend
node server.js
```

### 6. Access the Application

Open `index.html` in your web browser.

## 🧪 Test the Installation

```bash
cd backend
python test_steg.py
node test_server.js
```

## 🆘 Common Issues

**"Module not found" errors:**
- Run `npm install` in the backend directory
- Run `pip install -r requirements.txt`

**Database connection errors:**
- Make sure PostgreSQL is running
- Check your `.env` file credentials
- Verify the database exists

**Python script errors:**
- Ensure Python 3.7+ is installed
- Check that all Python packages are installed

## 📞 Need Help?

- Check the full [README.md](README.md) for detailed instructions
- Review the troubleshooting section
- Run the test scripts to verify functionality

---

**That's it!** Your steganography application should now be running. 🎉 