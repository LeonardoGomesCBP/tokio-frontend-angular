# Build stage
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server with host 0.0.0.0 to allow external access
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "500"]