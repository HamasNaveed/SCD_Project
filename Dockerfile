# Use Node.js 18 (matches our application requirements)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p data backups

# Start the application
CMD ["node", "main.js"]
