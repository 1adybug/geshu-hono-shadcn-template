# syntax=docker.io/docker/dockerfile:1

FROM node:lts-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends -o Acquire::Retries=3 openssl \
    && npm install --global pnpm@11.10.0 \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BETTER_AUTH_SECRET=docker-build-only-secret-not-for-runtime
ARG BETTER_AUTH_URL=http://example.com
ARG DEFAULT_EMAIL_DOMAIN=example.com

RUN pnpm exec prisma generate
RUN pnpm run build

FROM deps AS production-deps

RUN pnpm prune --prod

FROM base AS runner

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends -o Acquire::Retries=3 gosu \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --create-home hono

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=deps /app/node_modules/prisma/package.json ./prisma-package.json

RUN npm install --global "prisma@$(node -p "require('./prisma-package.json').version")" \
    && rm ./prisma-package.json \
    && mkdir -p /app/data \
    && chown -R hono:nodejs /app/data

RUN printf '#!/bin/sh\nset -e\nmkdir -p /app/data\nchown -R hono:nodejs /app/data\nchmod -R u+rwX,g+rwX /app/data\nnode scripts/ensureDatabaseFile.mjs\nprisma migrate deploy\nchown -R hono:nodejs /app/data\nchmod -R u+rwX,g+rwX /app/data\nexec gosu hono node dist/server/index.mjs\n' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
