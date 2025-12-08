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

FROM scratch

COPY --from=alpine /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=ghcr.io/tarampampam/microcheck:1 /bin/httpcheck /bin/httpcheck
COPY --from=backend /app/main /bin/main

HEALTHCHECK --interval=5m --timeout=2s --retries=3 --start-period=15s CMD [ \
    "/bin/httpcheck", "--fail", "http://127.0.0.1:3909" \
]

ENTRYPOINT [ "main" ]
