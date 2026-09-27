# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# ---- Dependencies -----------------------------------------------------
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Prisma client generation -----------------------------------------
FROM deps AS prisma-generate
COPY prisma.config.ts ./
COPY prisma ./prisma
# Only needed so prisma.config.ts / dotenv don't fail; no DB connection is made.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN bunx prisma generate

# ---- Runtime ------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma-generate /app/src/generated ./src/generated
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

EXPOSE 3000

CMD ["bun", "src/main.ts"]
