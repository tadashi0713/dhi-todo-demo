FROM node:25-slim
# FROM dhi.io/node:25-debian13-dev

WORKDIR /app
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
