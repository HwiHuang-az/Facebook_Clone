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
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
    defaultValue: 'accepted'
  },
  initiatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Friendships',
  timestamps: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['user1Id', 'user2Id'],
      unique: true,
      name: 'unique_friendship'
    },
    {
      fields: ['user1Id']
    },
    {
      fields: ['user2Id']
    },
    {
      fields: ['status']
    }
  ],
  validate: {
    usersNotSame() {
      if (this.user1Id === this.user2Id) {
        throw new Error('Người dùng không thể kết bạn với chính mình');
      }
    }
  }
});

module.exports = Friendship;