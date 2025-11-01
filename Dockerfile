# -------- BUILD STAGE --------
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package.json & package-lock.json dulu untuk caching
    COPY package*.json ./
    
    # Install dependencies
    RUN npm ci
    
    # Copy semua source code
    COPY . .
    
    # Build aplikasi Vite
    RUN npm run build
    
    # -------- FINAL STAGE --------
    FROM node:20-alpine
    
    # Set working directory
    WORKDIR /output
    
    # Copy hasil build dari stage sebelumnya
    COPY --from=builder /app/dist ./dist
    
    # Install serve untuk serve build statis
    RUN npm install -g serve
    
    # Expose port Vite default
    EXPOSE 5173
    
    # Jalankan server statis
    CMD ["serve", "-s", "dist", "-l", "5173"]
    