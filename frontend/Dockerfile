# Sử dụng image Node.js chính thức
FROM node:18

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json (nếu có) vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Thiết lập biến môi trường (nếu cần)
ENV PORT=3000

# Mở cổng ứng dụng
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]    