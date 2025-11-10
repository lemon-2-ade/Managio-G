# Use the official Node.js 18 LTS image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) first
# This allows Docker to cache the npm install step if dependencies haven't changed
COPY package*.json ./

# Install dependencies
# Use npm ci for faster, reliable, reproducible builds in production
RUN npm ci --only=production && npm cache clean --force

# Copy the .env and rest of the application code
COPY . .
COPY .env ./

# Expose the port that the app runs on
EXPOSE 3000

# Define environment variable defaults (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]