FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose API port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
