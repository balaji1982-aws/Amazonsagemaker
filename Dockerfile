# Use Node.js base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

CMD ["node", "index.js"]

# Start the app
CMD ["npm", "start"]

