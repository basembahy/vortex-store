FROM node:18-alpine

WORKDIR /app

# Copy root and subpackage package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy application source code
COPY . .

# Build React client bundle
RUN npm run build

# Expose server port (default 7860 for Hugging Face Spaces or 5000)
ENV PORT=7860
ENV NODE_ENV=production

EXPOSE 7860

CMD ["node", "server/src/server.js"]
