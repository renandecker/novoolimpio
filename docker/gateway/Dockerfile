# ==============================================================================
# Dockerfile — gateway (nginx)
# ==============================================================================
# Build:
#   docker build -t olimpio-gateway .
#
# Run:
#   docker run -p 8080:8080 olimpio-gateway
# ==============================================================================

FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Non-root user (container security best practice)
# nginx user already exists in the image

# 8080 is the default port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
    CMD wget -qO- http://localhost:8080/ >/dev/null 2>&1 || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]