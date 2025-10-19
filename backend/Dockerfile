FROM node:18
WORKDIR /usr/src/app

# luôn copy đúng 2 file này (tránh COPY package*.json khiến docker lấy nhầm)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# (giữ nguyên các phần còn lại)
RUN npm rebuild bcrypt || true
COPY . .
ENV NODE_ENV=development
ENV PORT=4000
EXPOSE 4000
CMD ["npm", "run", "dev"]
