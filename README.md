# Facebook Clone - Dự án cá nhân

Đây là dự án cá nhân tạo ra một bản sao của Facebook sử dụng công nghệ hiện đại.

## 🚀 Công nghệ sử dụng

### Frontend
- **React.js** - Thư viện JavaScript cho giao diện người dùng
- **Tailwind CSS** - Framework CSS tiện ích
- **React Router** - Điều hướng ứng dụng
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Cơ sở dữ liệu quan hệ
- **Sequelize** - ORM cho MySQL
- **JWT** - JSON Web Tokens cho xác thực
- **Socket.io** - Real-time communication
- **Multer** - File upload middleware
- **Bcrypt** - Password hashing

## 📁 Cấu trúc dự án

```
facebook-clone/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── package.json
└── database/              # MySQL scripts
    └── facebook_clone.sql
```

## 🔧 Cài đặt và chạy dự án

### 1. Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Cấu hình database

- Cài đặt MySQL localhost
- Tạo database tên `facebook_clone`
- Import file `database/facebook_clone.sql`

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `server/`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=facebook_clone
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Chạy ứng dụng

```bash
# Chạy backend (terminal 1)
cd server
npm run dev

# Chạy frontend (terminal 2)
cd client
npm start
```

## 🌟 Tính năng chính

- ✅ Đăng ký / Đăng nhập
- ✅ Tạo và hiển thị bài viết
- ✅ Like, Comment, Share
- ✅ Upload ảnh/video
- ✅ Thông báo real-time
- ✅ Chat realtime
- ✅ Tìm kiếm bạn bè
- ✅ Profile cá nhân
- ✅ News Feed
- ✅ Timeline

## 🎨 Giao diện

Giao diện được thiết kế giống hệt Facebook gốc với:
- Header navigation giống Facebook
- Sidebar menu
- News feed với infinite scroll
- Chat messenger
- Notification dropdown
- Mobile responsive

## ⚠️ Lưu ý

Đây là dự án cá nhân được tạo ra cho mục đích học tập và không có ý định thương mại hóa hoặc vi phạm bản quyền của Facebook.

## 📝 License

Dự án này chỉ dành cho mục đích giáo dục và cá nhân. 