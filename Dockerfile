FROM node:22-slim

WORKDIR /app

# Install dependencies for keytar (libsecret) and Chromium for puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libsecret-1-0 \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
  && rm -rf /var/lib/apt/lists/*

# Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

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
