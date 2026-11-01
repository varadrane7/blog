# Base stage for building the static files
FROM node:22 AS base
WORKDIR /app

# Install pnpm (pinned; node images newer than 24 no longer ship corepack)
RUN npm install -g pnpm@10.34.9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Runtime stage for serving the application
FROM nginx:mainline-alpine-slim AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 80
