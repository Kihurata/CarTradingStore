# --- Stage 1: Cài đặt Dependencies ---
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# Dùng --legacy-peer-deps để tránh lỗi version thư viện nếu có
RUN npm ci --legacy-peer-deps

# --- Stage 2: Build ứng dụng ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Chạy build (Lúc này next.config.ts đã bỏ qua lỗi nên sẽ chạy qua được)
RUN npm run build

# --- Stage 3: Chạy ứng dụng ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]