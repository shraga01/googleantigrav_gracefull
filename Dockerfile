FROM node:20-alpine

WORKDIR /app

# Copy server files only
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server source code
COPY server/ .

# Cloud Run uses PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
