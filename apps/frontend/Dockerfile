# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace apps/frontend --include-workspace-root

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY package.json package-lock.json* ./
COPY apps/frontend apps/frontend

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build --workspace apps/frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/apps/frontend/.next/standalone ./
COPY --from=build /repo/apps/frontend/public ./apps/frontend/public
COPY --from=build /repo/apps/frontend/.next/static ./apps/frontend/.next/static

EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
