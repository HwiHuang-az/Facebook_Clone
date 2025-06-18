const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cấu hình kết nối MySQL cho Facebook Clone
const sequelize = new Sequelize(
  process.env.DB_NAME || 'facebook_clone',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4'
    }
  }
);

// Test kết nối database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công!');
  } catch (error) {
    console.error('❌ Không thể kết nối đến MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 