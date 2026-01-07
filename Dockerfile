# Use Node.js as the base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY Backend/package*.json ./Backend/
COPY Frontend/package*.json ./Frontend/

# Install dependencies for root, backend, and frontend
RUN npm install
RUN npm install --prefix Backend
RUN npm install --prefix Frontend

# Copy the rest of the application
COPY . .

# Build the frontend
RUN npm run build --prefix Frontend

# Expose the port the app runs on
EXPOSE 5001

# Set the environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
