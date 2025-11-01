# -------- BUILD IMAGE --------

FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json dulu untuk caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy semua source code
COPY . .

# Build Vite app
RUN npm run build

# Final stage - hanya untuk copy hasil build
FROM alpine:latest

# Install tar untuk extract
RUN apk add --no-cache tar

WORKDIR /output

# Copy build output dari builder
COPY --from=builder /app/dist ./dist

# Set default command (bisa di-override saat run)
CMD ["sh"]
