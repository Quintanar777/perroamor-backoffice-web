# syntax=docker/dockerfile:1.6

# === Stage 1: build the SPA ===
FROM node:20-alpine AS builder
WORKDIR /app

# Activate pnpm via corepack (matches local toolchain)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Cache layer for dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .

# Vite hornea las env vars en BUILD TIME, no runtime.
# La URL del backend tiene que estar disponible aquí, vía build arg.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build


# === Stage 2: serve with nginx ===
FROM nginx:1.27-alpine AS runtime

# Copy SPA bundle
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template — nginx:alpine corre envsubst sobre archivos .template
# y deja el resultado en /etc/nginx/conf.d/. Sustituye ${PORT}; deja $uri y demás
# vars de nginx intactas (no tienen llaves).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Railway inyecta PORT en runtime; default 8080 para correr local con `docker run`.
ENV PORT=8080
EXPOSE 8080
