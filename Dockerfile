FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM base AS development
ENV NODE_ENV=development
RUN npm ci
EXPOSE 3000
CMD ["node", "src/server.js"]

FROM base AS production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
