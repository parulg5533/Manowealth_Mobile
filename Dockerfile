# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime Stage ----
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed modules and source
COPY --from=builder /app/node_modules ./node_modules
COPY index.js mailService.js otpService.js ./
COPY backend/ ./backend/

# Create uploads directory with correct ownership
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3030

CMD ["node", "index.js"]
