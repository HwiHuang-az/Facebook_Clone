const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FriendList = sequelize.define('FriendList', {
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
  listName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'list_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
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
  tableName: 'friend_lists',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'is_default']
    }
  ]
});

module.exports = FriendList;
