FROM node:20-slim AS frontend
WORKDIR /app

RUN npm install -g corepack@latest && corepack use pnpm@latest

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM golang:1.23 AS backend
WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
COPY --from=frontend /app/dist ./ui/dist
RUN make

FROM debian:bookworm-slim

COPY --from=backend /app/main /bin/main

RUN apt update && apt install -y ca-certificates && rm -rf /var/lib/apt/lists/*

CMD [ "/bin/main" ]
