# -------- BUILD STAGE --------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy package.json & package-lock.json dulu untuk caching
    COPY package*.json ./
    
    # Install dependencies
    RUN npm ci
    
    # Copy semua source code
    COPY . .
    
    # Build args untuk production VITE_API_URL
    ARG VITE_API_URL
    ENV VITE_API_URL=${VITE_API_URL}
    
    # Build aplikasi Vite (production)
    RUN npm run build
    
    # -------- FINAL IMAGE --------
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Copy hasil build dari builder
    COPY --from=builder /app/dist ./dist
    
    # Copy package.json & source code untuk dev server (opsional)
    COPY --from=builder /app/package*.json ./ 
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app ./ 
    
    # Install serve untuk production
    RUN npm install -g serve
    
    EXPOSE 5173
    
    # Default command: production serve
    CMD ["serve", "-s", "dist", "-l", "5173"]
    
    # -------- OPTIONAL: Dev mode --------
    # Jalankan dev server dengan environment runtime
    # docker run -it --env-file .env <image> npm run dev
    