# 🚀 Hướng dẫn Setup Facebook Clone

## 📋 YÊU CẦU HỆ THỐNG

- Node.js 16+ 
- MySQL 8.0+
- npm hoặc yarn

## 🗄️ BƯỚC 1: CÀI ĐẶT MYSQL

### Option 1: Tải MySQL từ trang chính thức
1. Vào https://dev.mysql.com/downloads/mysql/
2. Tải MySQL Community Server 8.0
3. Cài đặt với password root (hoặc để trống)

### Option 2: Dùng XAMPP (Dễ hơn)
1. Tải XAMPP: https://www.apachefriends.org/
2. Cài đặt XAMPP
3. Mở XAMPP Control Panel
4. Start Apache và MySQL

### Option 3: Dùng MySQL với Docker
```bash
docker run --name mysql-fb -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql:8.0
```

## 🔧 BƯỚC 2: KIỂM TRA MYSQL

### Kiểm tra MySQL đã chạy:
```bash
# Windows
net start | findstr MySQL
# Hoặc
tasklist | findstr mysql

# Nếu dùng XAMPP
# Mở XAMPP Control Panel và start MySQL
```

### Test kết nối MySQL:
```bash
# Nếu có password
mysql -u root -p

# Nếu không có password (localhost)
mysql -u root

# Nếu dùng XAMPP
mysql -u root -h localhost
```

## 📁 BƯỚC 3: TẠO DATABASE

### Cách 1: Command line
```bash
# Nếu có password
mysql -u root -p < database/facebook_clone.sql

# Nếu không có password  
mysql -u root < database/facebook_clone.sql

# Nếu dùng XAMPP
mysql -u root -h localhost < database/facebook_clone.sql
```

### Cách 2: phpMyAdmin (XAMPP)
1. Mở http://localhost/phpmyadmin
2. Import file `database/facebook_clone.sql`

### Cách 3: MySQL Workbench
1. Mở MySQL Workbench
2. Kết nối với localhost:3306
3. File → Run SQL Script → Chọn `database/facebook_clone.sql`

## 🛠️ BƯỚC 4: CẤU HÌNH PROJECT

### Backend (.env file):
Tạo file `server/.env`:
```env
# Database - Không có password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=facebook_clone
DB_PORT=3306

# Database - Có password
# DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env file):
Tạo file `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## ▶️ BƯỚC 5: CHẠY PROJECT

### Terminal 1 - Backend:
```bash
cd server
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm install
npm start
```

## 🌐 TRUY CẬP

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **phpMyAdmin**: http://localhost/phpmyadmin (nếu dùng XAMPP)

## 🔑 TÀI KHOẢN DEMO

```
Email: john.doe@example.com
Password: 123456

Email: jane.smith@example.com  
Password: 123456
```

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Lỗi "Can't connect to MySQL server"
```bash
# Kiểm tra MySQL có chạy
net start | findstr MySQL

# Start MySQL (thay tên service tương ứng)
net start MySQL80
# hoặc
net start MySQL

# Nếu dùng XAMPP, mở XAMPP Control Panel và start MySQL
```

### 2. Lỗi "Access denied for user 'root'"
```bash
# Reset password MySQL
mysqladmin -u root password newpassword

# Hoặc kết nối với user khác
mysql -u root -p
```

### 3. Lỗi "Database 'facebook_clone' doesn't exist"
```bash
# Tạo database trước
mysql -u root -e "CREATE DATABASE facebook_clone;"
mysql -u root facebook_clone < database/facebook_clone.sql
```

### 4. Port 3306 đã được sử dụng
```bash
# Kiểm tra process nào đang dùng port 3306
netstat -ano | findstr :3306

# Kill process (thay PID tương ứng)
taskkill /PID 1234 /F
```

## 🎯 KIỂM TRA HOẠT ĐỘNG

1. ✅ MySQL server chạy
2. ✅ Database `facebook_clone` đã tạo
3. ✅ Backend API trả về JSON tại http://localhost:5000/api/auth/test
4. ✅ Frontend hiển thị trang login
5. ✅ Đăng ký/đăng nhập thành công

## 📞 HỖ TRỢ

Nếu gặp lỗi, hãy:
1. Kiểm tra logs ở terminal
2. Verify database connection
3. Check port conflicts
4. Restart services

**Good luck! 🚀** 