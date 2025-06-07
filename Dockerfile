# Use the full Node.js image as it includes necessary build tools
FROM node:18

# Use the full Node.js image as it includes necessary build tools
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install system dependencies required for mathjax-node
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application's source code into the container
COPY . .

# --- NEW, MORE ROBUST DEBUGGING STEP ---
# This command will check if app.js exists. If it doesn't, the build will fail here.
RUN if [ ! -f app.js ]; then echo "--> BUILD FAILED: app.js was NOT found after the COPY command!"; exit 1; fi

# Expose the port the app runs on
EXPOSE 3000

# The command to start the application
CMD [ "node", "app.js" ]