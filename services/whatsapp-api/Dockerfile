FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps || true
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p .

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
VOLUME ["/app/.wawsessions"]
EXPOSE 4001
CMD ["node", "dist/index.js"]
