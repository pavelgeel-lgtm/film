# ── Stage 1: Build frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ── Stage 2: Build server deps ───────────────────────────────────────────
FROM node:20-alpine AS server-builder
WORKDIR /server
RUN apk add --no-cache python3 make g++
COPY server/package.json server/package-lock.json* ./
RUN npm ci

# ── Stage 3: nginx serving frontend ──────────────────────────────────────
FROM nginx:alpine AS nginx-stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Stage 4: Node server ──────────────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app
COPY --from=server-builder /server/node_modules ./server/node_modules
COPY server/ ./server/
RUN mkdir -p uploads/kpp
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/index.js"]
