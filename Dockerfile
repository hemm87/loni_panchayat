# Dockerfile for a Next.js application

# 1. Base Image: Use an official Node.js image.
# Using a specific version is good practice for reproducibility.
FROM node:20-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
RUN npm install

# 4. Build the application
# Copy the rest of your app's source code
COPY . .
# Run the build script defined in package.json
RUN npm run build

# 5. Production Image: Create a smaller image for production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from the 'base' stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# The command to start the app in production mode
CMD ["npm", "start", "--", "-p", "3000"]
