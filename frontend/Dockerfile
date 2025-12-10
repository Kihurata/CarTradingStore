# --- Stage 1: Cài đặt Dependencies ---
FROM node:18-alpine AS deps
# Cài thêm libc6-compat vì một số thư viện nodejs cần nó trên Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json trước để tận dụng cache của Docker
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Build ứng dụng ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry của Next.js để build nhanh hơn
ENV NEXT_TELEMETRY_DISABLED 1

# Chạy lệnh build (Tạo ra thư mục .next/standalone)
RUN npm run build

# --- Stage 3: Chạy ứng dụng (Production) ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Tạo user không phải root để bảo mật hơn
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy thư mục public (chứa ảnh, icon...)
COPY --from=builder /app/public ./public


COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Chuyển sang user thường
USER nextjs

EXPOSE 3000


CMD ["node", "server.js"]