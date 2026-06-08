"tok-comment"># ── Stage 1: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY src/ ./src/
 
"tok-comment"># ── Stage 2: Runtime ──
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app .
 
USER appuser
EXPOSE 3000
 
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http:"tok-comment">//localhost:3000/health || exit 1
 
CMD ["node", "src/index.js"]
