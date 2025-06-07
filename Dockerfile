# Use an official Node.js runtime as a parent image.
# The standard 'node:18' image includes build tools needed for packages like mathjax-node.
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "index.js" ]