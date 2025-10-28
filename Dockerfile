FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci --only=production && npm cache clean --force; fi

# Copy source code
COPY . .

# Create .env.local from template if it doesn't exist
RUN if [ ! -f .env.local ]; then cp env.template .env.local; fi

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
