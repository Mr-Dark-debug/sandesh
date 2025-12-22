# Stage 1: Build Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if any (none needed for pure python logic mostly)
# We might need gcc for some python packages if wheels aren't available, but standard ones are usually fine.

# Copy Backend requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend

# Copy Built Frontend to Backend Static folder
COPY --from=frontend-build /app/frontend/dist ./backend/static

# Environment variables should be passed at runtime, but we can set defaults
ENV PYTHONPATH=/app

# Create volume mount point
RUN mkdir -p /data
VOLUME /data

# Expose ports
# 8000 for Web/API, 2525 for SMTP
EXPOSE 8000 2525

# Run command
# We run uvicorn on 0.0.0.0:8000. SMTP runs inside this process on 2525.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
