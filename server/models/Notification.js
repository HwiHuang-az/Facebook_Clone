const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'from_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'like', 'comment', 'friend_request', 
      'friend_accept', 'message', 'mention'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: 'Notification'
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'comment_id',
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'action_url'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id', 'is_read', 'created_at']
    }
    // {
    //   fields: ['fromUserId']
    // },
    // {
    //   fields: ['type']
    // },
    // {
    //   fields: ['postId']
    // },
    // {
    //   fields: ['commentId']
    // }
  ]
});

module.exports = Notification;