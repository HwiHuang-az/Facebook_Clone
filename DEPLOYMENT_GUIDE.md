# Hướng dẫn Triển khai (Deployment Guide) - Facebook Clone

Dự án hiện tại đã hoàn thiện và sẵn sàng để đưa lên Internet cho mọi người cùng sử dụng. Dưới đây là hướng dẫn chi tiết cách deploy miễn phí bằng **Vercel** (Frontend) và **Railway / Render** (Backend & Database).

## 1. Triển khai Cơ sở dữ liệu (Database) 
Thay vì dùng MySQL (XAMPP/Laragon) trên máy cá nhân, ta cần một MySQL Server online.

**Lựa chọn: Railway (khuyên dùng) hoặc Aiven:**
1. Tạo tài khoản trên [Railway.app](https://railway.app/).
2. Tạo dự án mới -> Chọn **Provision PostgreSQL** hoặc **Provision MySQL**.
3. Lấy chuỗi kết nối (Connection String) `DATABASE_URL` (vd: `mysql://user:pass@host:port/dbname`).
4. Sử dụng công cụ quản lý DB (như HeidiSQL hoặc DBeaver) kết nối vào DB mới này và chạy script SQL hiện tại của bạn để tạo bảng.

## 2. Triển khai Backend (API Server)
Cloud Provider: **Render.com** (miễn phí nhưng thỉnh thoảng sẽ bị "ngủ" nếu không ai truy cập).

1. Tạo một Repository mới trên GitHub và push code thư mục `server` lên đó (hoặc nguyên project).
2. Đăng nhập [Render.com](https://render.com/) -> New **Web Service**.
3. Kết nối với repo GitHub vừa tạo. Chọn thư mục root là `server` (nếu cần thiết lập gốc).
4. Cấu hình môi trường (Environment Variables) trên Render:
   - `PORT`: `5000` (hoặc tuỳ phiên bản port)
   - `DB_HOST`: (host từ DB Railway)
   - `DB_USER`: (user DB)
   - `DB_PASS`: (pass DB)
   - `DB_NAME`: (tên DB)
   - `JWT_SECRET`: (Mật khẩu bí mật token)
   - `CLIENT_URL`: `https://ten-mien-frontend-cua-ban.vercel.app` (cấu hình CORS)
5. Start Command: `npm run start` (nhớ sửa `package.json` trong `server` có script `"start": "node server.js"`).
6. Khi Web Service chạy màu Xanh (Live), copy cái URL API lưu lại (vd: `https://facebook-clone-backend.onrender.com`).

## 3. Triển khai Frontend (ReactJS)
Cloud Provider: **Vercel** (rất nhanh và miễn phí).

1. Đăng nhập [Vercel.com](https://vercel.com) bằng GitHub.
2. Thêm dự án mới (Add New Project) -> Trỏ tới thư mục `client` của repository GitHub.
3. Trong phần **Environment Variables**:
   - `REACT_APP_API_URL`: Dán link Backend từ bước 2 vào đây (vd: `https://facebook-clone-backend.onrender.com/api`).
4. Bấm **Deploy**. Cần khoảng 1-2 phút, Vercel sẽ tự sinh ra link ứng dụng Frontend cho bạn.

---

🎉 **Hoàn thành!** Bạn giờ đã có thể gửi link Vercel cho bạn bè tạo tài khoản, đăng bài, kết bạn và trò chuyện (Socket.io sẽ tự động nối qua link Render).

## Lưu ý (Troubleshooting)
- Nếu upload/tải ảnh bị mất, bạn cần thay **Cloudinary** hoặc **AWS S3** vào phần `uploadController` thay vì lưu trong ổ đĩa `/uploads` cục bộ ở server.
- Web Service miễn phí trên Render mất 15-30 giây để "thức tỉnh" nếu không ai truy cập lâu, nên lần load đầu tiên frontend gọi API sẽ hơi chậm.
