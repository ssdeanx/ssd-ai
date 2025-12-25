FROM node:18-alpine

WORKDIR /app

# Chrome/Chromium 의존성 설치 (puppeteer-core용)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Puppeteer 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Default port that Smithery sets (8081) and bind to all interfaces for container
ENV PORT=8081

# Start in HTTP transport mode, bind to 0.0.0.0 so container is reachable
CMD ["node", "dist/index.js", "--transport=http", "--port=8081", "--hostname=0.0.0.0"]
