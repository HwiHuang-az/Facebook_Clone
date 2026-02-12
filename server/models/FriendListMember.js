const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FriendListMember = sequelize.define('FriendListMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  listId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'list_id'
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'friend_id'
  },
  addedAt: {
    type: DataTypes.DATE,
    field: 'added_at'
  }
}, {
  tableName: 'friend_list_members',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['list_id', 'friend_id']
    },
    {
      fields: ['list_id']
    },
    {
      fields: ['friend_id']
    }
  ]
});

module.exports = FriendListMember;
