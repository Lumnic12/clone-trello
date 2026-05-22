# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Install OpenSSL and wget (for healthcheck) in runner
RUN apt-get update -y && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy what we need
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/index.js ./

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Run
CMD ["node", "index.js"]
