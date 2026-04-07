# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# SPA routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build statique
COPY --from=builder /app/dist /usr/share/nginx/html

# Entrypoint: génère env-config.js au démarrage depuis les vars d'env Railway
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
