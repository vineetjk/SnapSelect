# Multi-stage build for SnapSelect

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Production
FROM node:18-alpine
WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package*.json ./backend/

# Copy frontend build to be served by backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create directories for uploads and database
RUN mkdir -p /app/backend/uploads /app/backend/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_PATH=/app/backend/data/database.sqlite
ENV UPLOAD_DIR=/app/backend/uploads

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "dist/index.js"]
