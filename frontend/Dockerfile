# Use the official lightweight Node.js base image.
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

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

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Command to run your app
CMD ["yarn", "start"]
