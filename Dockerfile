FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/ ./packages/

RUN npm ci

FROM node:22-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/frontend/ ./apps/frontend/
COPY packages/ ./packages/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-/api}
ENV NEXT_PUBLIC_WS_URL=/
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

RUN npm run build --workspace=apps/frontend && \
    rm -rf /app/apps/frontend/.next/cache

FROM node:22-alpine AS backend-build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma && \
    npm run build --workspace=apps/backend

FROM node:22-alpine AS production
RUN apk add --no-cache libc6-compat && \
    npm install -g pm2@latest

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=backend-build /app/apps/backend/dist ./apps/backend/dist
COPY --from=backend-build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=backend-build /app/apps/backend/package.json ./apps/backend/
COPY --from=frontend-build /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=frontend-build /app/apps/frontend/public ./apps/frontend/public
COPY --from=frontend-build /app/apps/frontend/package.json ./apps/frontend/
COPY --from=frontend-build /app/apps/frontend/next.config.ts ./apps/frontend/
COPY --from=frontend-build /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY package.json ./

RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma

USER appuser

EXPOSE 3000 4000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
