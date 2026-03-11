FROM node:20-slim

WORKDIR /app
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
