const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockedUser = sequelize.define('BlockedUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blockerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'blocker_id'
  },
  blockedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'blocked_id'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'blocked_users',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['blocker_id', 'blocked_id']
    },
    {
      fields: ['blocker_id']
    },
    {
      fields: ['blocked_id']
    }
  ]
});

module.exports = BlockedUser;
