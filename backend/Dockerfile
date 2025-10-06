# Sử dụng image Node.js chính thức
FROM node:18

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json (nếu có) vào container
COPY package*.json ./


# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Thiết lập biến môi trường (nếu cần)
ENV NODE_ENV=production
ENV PORT=4000

# Mở cổng ứng dụng
EXPOSE 4000

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]