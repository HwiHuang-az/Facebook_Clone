# 🔥 Setup Facebook Clone với Laragon

## 📋 YÊU CẦU
- ✅ Laragon đã cài đặt
- ✅ Node.js (có sẵn trong Laragon)

## 🚀 BƯỚC 1: KHỞI ĐỘNG LARAGON

1. **Mở Laragon** (Right-click icon → Start All)
2. **Start MySQL**: 
   - Click vào MySQL trong Laragon interface
   - Hoặc Right-click Laragon icon → MySQL → Start

## 📊 BƯỚC 2: KIỂM TRA MYSQL

### Cách 1: Qua Laragon Interface
- Mở Laragon
- Click **Database** → **Open**
- Sẽ mở phpMyAdmin

### Cách 2: Terminal
```bash
# Test kết nối (không cần password với Laragon)
mysql -u root

# Thoát MySQL
exit
```

## 🗄️ BƯỚC 3: TẠO DATABASE

### Cách 1: phpMyAdmin (Khuyến nghị)
1. Mở Laragon → **Database** → **Open**
2. Truy cập: http://localhost/phpmyadmin
3. Click **Import**
4. Chọn file `database/facebook_clone.sql`
5. Click **Go**

### Cách 2: Command Line
```bash
# Import database
mysql -u root < database/facebook_clone.sql

# Hoặc nếu cần tạo database trước
mysql -u root -e "CREATE DATABASE facebook_clone;"
mysql -u root facebook_clone < database/facebook_clone.sql
```

### Cách 3: MySQL trong Laragon Terminal
```bash
# Mở MySQL
mysql -u root

# Tạo database
CREATE DATABASE facebook_clone;
USE facebook_clone;

# Import (copy paste nội dung file SQL)
# Hoặc dùng source command
source D:/duan_tn_fpl/Facebook/database/facebook_clone.sql;

# Thoát
exit;
```

## ⚙️ BƯỚC 4: CẤU HÌNH PROJECT

### Tạo file `server/.env`:
```env
# Database Laragon (không cần password)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=facebook_clone
DB_PORT=3306

# JWT
JWT_SECRET=facebook_clone_super_secret_key_2024_laragon_dev
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Tạo file `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```

## 🔧 BƯỚC 5: CÀI ĐẶT DEPENDENCIES

### Backend:
```bash
cd server
npm install
```

### Frontend:
```bash
cd client
npm install
```

## ▶️ BƯỚC 6: CHẠY PROJECT

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm start
```

## 🌐 TRUY CẬP

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **phpMyAdmin**: http://localhost/phpmyadmin
- **Laragon**: Right-click icon → Web

## 🔑 TÀI KHOẢN DEMO

### Users có sẵn:
```
Email: john.doe@example.com
Password: 123456

Email: jane.smith@example.com
Password: 123456

Email: mike.johnson@example.com
Password: 123456
```

### Admin Panel:
```
Email: john.doe@example.com (Super Admin)
Password: 123456
```

## 🐛 XỬ LÝ LỖI VỚI LARAGON

### 1. MySQL không kết nối được
```bash
# Kiểm tra MySQL có chạy
netstat -an | findstr :3306

# Restart MySQL trong Laragon
# Right-click Laragon → MySQL → Reload

# Hoặc restart toàn bộ Laragon
# Right-click Laragon → Stop All → Start All
```

### 2. Port conflict
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :3306
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process nếu cần
taskkill /PID xxxx /F
```

### 3. Database không tồn tại
```sql
-- Vào phpMyAdmin hoặc MySQL command line
SHOW DATABASES;
CREATE DATABASE facebook_clone;
USE facebook_clone;
SHOW TABLES;
```

### 4. Permission denied
```bash
# Check user permissions
mysql -u root -e "SELECT user, host FROM mysql.user;"

# Grant all privileges
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';"
```

## 🎯 KIỂM TRA HOẠT ĐỘNG

1. ✅ Laragon icon màu xanh (đang chạy)
2. ✅ MySQL trong Laragon hiển thị "Running"
3. ✅ phpMyAdmin accessible tại http://localhost/phpmyadmin
4. ✅ Database `facebook_clone` có 38 tables
5. ✅ Backend API tại http://localhost:5000/api
6. ✅ Frontend tại http://localhost:3000

## 🚀 TIPS VỚI LARAGON

### Quick Access:
- **Right-click Laragon icon** → Quick access to all services
- **Laragon → www** → Thư mục web projects
- **Laragon → Database** → phpMyAdmin
- **Laragon → Terminal** → Command line với PHP/Node paths

### Useful Commands:
```bash
# Restart specific service
laragon mysql restart
laragon nginx restart

# Check Laragon status
laragon status

# Open project folder
laragon open
```

## 📱 TEST TRÊN MOBILE

Với Laragon, bạn có thể test trên mobile:
1. Check IP máy: `ipconfig`
2. Truy cập: `http://YOUR_IP:3000`
3. Hoặc dùng pretty URL của Laragon

**Chúc bạn code vui vẻ với Laragon! 🎉** 