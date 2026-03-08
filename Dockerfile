FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY src ./src
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
