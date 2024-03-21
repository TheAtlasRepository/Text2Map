# Use the official lightweight Node.js base image.
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json for npm) files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of your application's code
COPY . .

# Build your Next.js application
RUN yarn build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["yarn", "start"]
