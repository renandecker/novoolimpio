# ==============================================================================
# Dockerfile — web-react (React 18 / Vite / TypeScript)
# ==============================================================================
# Build:
#   docker build -t olimpio-web-react --build-arg VITE_API_URL=http://localhost:8080 .
#
# Run:
#   docker run -p 3000:3000 olimpio-web-react
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: runtime (nginx)
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user (container security best practice)
# nginx user already exists in the image

# 3000 is the default port (can be overridden at runtime with -e PORT=<other-port>
# but requires nginx config change, so typically fixed)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
    CMD wget -qO- http://localhost:3000/ || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]