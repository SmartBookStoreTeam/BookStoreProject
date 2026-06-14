FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json & package-lock.json first
COPY package*.json ./

# Install build dependencies for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
