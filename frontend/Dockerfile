FROM node:18

WORKDIR /usr/src/app

# Copy package files và install deps
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# ENV (nếu cần)
ENV NODE_ENV=development
ENV PORT=3000
ENV VITE_API_URL=http://localhost:4000/api

EXPOSE 3000

# CMD chạy dev server (không override script, để package.json handle --hostname)
CMD ["npm", "run", "dev"]