# Base image with Python 3.11
FROM python:3.11-slim

# Install Node.js 18.x
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend package files first (for better layer caching)
COPY backend/package*.json ./
COPY backend/requirements.txt ./

# Install Node dependencies
RUN npm install --production

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of backend code
COPY backend/ ./

# Create uploads directory
RUN mkdir -p uploads

# Expose API port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start backend server
CMD ["npm", "start"]
