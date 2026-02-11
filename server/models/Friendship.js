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
  // Fields not in SQL schema
  // status: {
  //   type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
  //   defaultValue: 'accepted'
  // },
  // initiatedBy: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: 'users',
  //     key: 'id'
  //   }
  // },
  // acceptedAt: {
  //   type: DataTypes.DATE,
  //   allowNull: true
  // }
}, {
  tableName: 'friendships',
  timestamps: true,
  createdAt: 'created_at',
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
      if (this.user1Id === this.user2Id) {
        throw new Error('Người dùng không thể kết bạn với chính mình');
      }
    }
  }
});

module.exports = Friendship;