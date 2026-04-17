FROM node:24-alpine3.22
# FROM dhi.io/node:24-alpine3.22-dev

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
