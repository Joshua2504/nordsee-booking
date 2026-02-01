# Stage 1: Build Vue.js frontend
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Node.js backend
FROM node:24-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ .

# Copy built Vue.js app from stage 1
COPY --from=frontend-build /app/frontend/dist ./public

# Create uploads directory
RUN mkdir -p /data/uploads

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
