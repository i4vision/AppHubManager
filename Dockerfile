# Multi-stage build for App Launcher
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (frontend + backend)
# Using build.mjs to exclude vite imports from production bundle
RUN npx vite build && node build.mjs

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install all dependencies (needed because esbuild bundles vite imports)
# Vite won't be used in production but must be present for imports to resolve
RUN npm ci && npm cache clean --force

# Copy built files from builder stage
# dist/index.js = server bundle
# dist/public/ = frontend assets (index.html, assets/, etc.)
COPY --from=builder /app/dist ./dist

# Expose port (default 5000)
EXPOSE 5000

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check (uses simple /health endpoint, no database dependency)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
