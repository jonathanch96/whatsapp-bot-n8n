FROM node:20

# Install system dependencies for Chrome and Puppeteer
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates fonts-noto-color-emoji \
        libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
        libxkbcommon0 libgbm1 libasound2 libpangocairo-1.0-0 \
        libpango-1.0-0 libgtk-3-0 && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (for better Docker caching)
COPY package*.json ./
RUN npm install

# Now copy the rest of the app
COPY . .

CMD ["node", "index.js"]

