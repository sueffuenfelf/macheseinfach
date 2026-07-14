# syntax=docker/dockerfile:1
# macheseinfa.ch — static Vite SPA (Bun workspace).
# Dokploy builds from repo root (buildPath `.`); nginx serves the compiled bundle.
FROM oven/bun:1 AS build
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN bun run --filter @macheseinfach/website build

FROM nginx:1.27-alpine AS serve

COPY --from=build /app/apps/website/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
