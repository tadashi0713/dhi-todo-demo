FROM node:26-alpine3.24
# FROM dhi.io/node:26-alpine3.24-dev

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
