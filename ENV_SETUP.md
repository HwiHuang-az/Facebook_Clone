# Hướng dẫn Setup Environment Variables

## Server (.env)

Tạo file `server/.env` với nội dung:

```env
# Database Configuration
DB_NAME=facebook_clone
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=facebook_clone_super_secret_key_2024_very_long_and_secure
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Configuration (optional)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

## Client (.env)

Tạo file `client/.env` với nội dung:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Facebook Clone
REACT_APP_VERSION=1.0.0

# Socket.io Configuration
REACT_APP_SOCKET_URL=http://localhost:5000

# Google Maps API (optional)
REACT_APP_GOOGLE_MAPS_API_KEY=

# Firebase Configuration (optional)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
```

## Lưu ý

1. **KHÔNG** commit file `.env` vào git
2. Thay đổi `JWT_SECRET` thành một string ngẫu nhiên dài và bảo mật
3. Điền thông tin database MySQL của bạn
4. Các trường optional có thể để trống nếu không sử dụng 