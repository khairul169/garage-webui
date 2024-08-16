FROM node:20-slim AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS frontend
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM base AS backend-deps
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -prod --frozen-lockfile
COPY backend .

FROM oven/bun:alpine AS backend
WORKDIR /app
COPY --from=backend-deps /app .
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app

ENV NODE_ENV=production
ENV DIST_ROOT=./dist

COPY --from=frontend /app/dist /app/dist
COPY --from=backend /app/dist /app

ENTRYPOINT [ "bun" , "run", "main.js" ]
