FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# Add app
COPY . ./

# Compile TypeScript to JavaScript
RUN npx tsc

# Start app in production
CMD ["npm", "start"]
