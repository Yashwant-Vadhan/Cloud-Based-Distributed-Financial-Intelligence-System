# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production Release
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

# Copy built code / assets from builder
COPY --from=builder /app/src ./src

# Use non-root user for security
USER node

EXPOSE 5002

CMD ["node", "src/server.js"]