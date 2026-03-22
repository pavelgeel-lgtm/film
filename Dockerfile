# ── Stage 1: Build frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ── Stage 2: Build server ────────────────────────────────────────────────
FROM node:20-alpine AS server-builder
WORKDIR /server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --ignore-scripts

# ── Stage 3: Final image ─────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Копируем сервер
COPY --from=server-builder /server/node_modules ./server/node_modules
COPY server/ ./server/

# Копируем собранный фронт (nginx будет его отдавать)
COPY --from=frontend-builder /app/dist ./dist

# Папка для загрузок КПП (монтировать как volume)
RUN mkdir -p uploads/kpp

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/index.js"]
