# Use the full Node.js image as it includes necessary build tools
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install system dependencies required for mathjax-node
# This is a robust way to ensure build tools are present.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application's source code into the container
COPY . .

# --- DEBUGGING STEP ---
# List the files in the current directory (/usr/src/app).
# We will look for this output in the Portainer build logs.
RUN echo "--- Listing files in /usr/src/app ---" && ls -la

# Expose the port the app runs on
EXPOSE 3000

# The command to start the application
CMD [ "node", "app.js" ]