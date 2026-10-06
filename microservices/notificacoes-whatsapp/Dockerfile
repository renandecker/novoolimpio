# ==============================================================================
# Dockerfile — notificacoes-whatsapp (Node.js 20 / TypeScript)
# ==============================================================================
# Build:
#   docker build -t olimpio-notificacoes-whatsapp .
#
# Run:
#   docker run -p 3030:3030 \
#     -e PORT=3030 \
#     olimpio-notificacoes-whatsapp
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user (container security best practice)
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copy built artifacts from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package.json ./

USER nodejs

# Production database configuration (can be overridden at runtime with -e)
ENV DATABASE_URL="postgresql://postgres:postgres@216.238.106.140:5423/olimpio_novo"
ENV DATABASE_USER="postgres"
ENV DATABASE_PASSWORD="postgres"
ENV DATABASE_HOST="216.238.106.140"
ENV DATABASE_PORT="5423"
ENV DATABASE_NAME="olimpio_novo"

# 3030 is the default port (can be overridden at runtime with -e PORT=<other-port>)
EXPOSE 3030

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
    CMD wget -qO- http://localhost:3030/health || exit 1

ENTRYPOINT ["node", "dist/index.js"]