const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user1_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user2_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
    defaultValue: 'accepted',
    allowNull: false
  },
  initiatedBy: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    field: 'initiated_by'
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'accepted_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['user1_id', 'user2_id'],
      unique: true,
      name: 'unique_friendship'
    }
  ],
  validate: {
    usersNotSame() {
      if (this.user1Id && this.user2Id && this.user1Id === this.user2Id) {
        throw new Error('Người dùng không thể kết bạn với chính mình');
      }
    }
  }
});

module.exports = Friendship;