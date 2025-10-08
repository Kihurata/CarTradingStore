FROM node:18

WORKDIR /usr/src/app

# Copy package files và install deps (bao gồm devDeps ts-node)
COPY package*.json ./
RUN npm ci

# Rebuild bcrypt for Docker platform (fix ELF header)
RUN npm rebuild bcrypt

# Copy source code (volumes mount cho hot reload)
COPY . .

# ENV
ENV NODE_ENV=development
ENV PORT=4000

EXPOSE 4000

# CMD chạy dev mode (ts-node, no build dist)
CMD ["npm", "run", "dev"]