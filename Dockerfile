# Dockerfile for a Next.js application

# 1. Base Stage: Install dependencies and build the application
FROM node:20-alpine AS base
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Create an empty public directory if it doesn't exist
RUN mkdir -p public

# Build the Next.js application
RUN npm run build

# 2. Production Stage: Create a clean, production-ready image
FROM node:20-alpine AS production
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from the base stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# The command to start the application
CMD ["npm", "start"]
