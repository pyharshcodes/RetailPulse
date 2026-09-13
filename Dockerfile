# Multi-stage production build for RetailPulse (Full-Stack Unified Container)

# Step 1: Build React 19 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Step 2: Python Backend Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for SQLite, ReportLab PDF, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application and verified database
COPY backend ./backend

# Copy production frontend build from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 8000

ENV PYTHONPATH=/app
ENV ENVIRONMENT=production

# Support dynamic cloud PORT environment variable (Render, Railway, Fly.io, Cloud Run, Heroku)
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
