const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  privacy: {
    type: DataTypes.ENUM('public', 'closed', 'secret'),
    defaultValue: 'public'
  },
  coverPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cover_photo'
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'admin_id'
  },
  membersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'members_count'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'groups',
  timestamps: true,
  indexes: [
    {
      fields: ['admin_id']
    },
    {
      fields: ['privacy']
    }
  ]
});

module.exports = Group;
