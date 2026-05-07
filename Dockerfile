# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

# Copy assets to public folder so the build tool includes them automatically
RUN mkdir -p public/assets && cp -r src/assets/* public/assets/

RUN npm run build

# Stage 2: Final image with backend + frontend static files
FROM python:3.14-alpine

RUN apk add --no-cache \
    curl \
    just \
    typst \
    cargo \
    rust \
    openssl-dev \
    perl \
    clang \
    meson \
    make

# Install uv
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy and install backend dependencies
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

# Copy backend source
COPY backend/ ./

# Copy built frontend static files
# Everything (including those assets) should now be inside /dist
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Expose backend port
EXPOSE 8080

# Run backend
CMD ["uv", "run", "--no-dev", "-m", "app"]
