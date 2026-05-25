# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies if needed (e.g. native addons)
# RUN apk add --no-cache python3 make g++

COPY package*.json ./
# Install ALL dependencies (including devDependencies if building TS/etc.)
RUN npm ci

COPY . .

# Stage 2: Production Release
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production


COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production

# Copy built code / assets from builder
COPY --from=builder /app/src ./src

# Use non-root user for security
USER node

EXPOSE 5001

CMD ["node", "src/server.js"]
