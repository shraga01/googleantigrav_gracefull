FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Cloud Run uses PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
