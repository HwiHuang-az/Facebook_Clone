const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  sessionToken: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'session_token'
  },
  deviceInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'device_info',
    get() {
      const value = this.getDataValue('deviceInfo');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('deviceInfo', value ? JSON.stringify(value) : null);
    }
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'user_sessions',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'is_active', 'expires_at']
    },
    {
      fields: ['session_token']
    }
  ]
});

module.exports = UserSession;
