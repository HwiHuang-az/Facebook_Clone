const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'),
    defaultValue: 'like'
  }
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['postId']
    },
    {
      fields: ['commentId']
    },
    {
      fields: ['userId', 'postId'],
      unique: true,
      name: 'unique_user_post_like'
    },
    {
      fields: ['userId', 'commentId'],
      unique: true,
      name: 'unique_user_comment_like'
    }
  ],
  validate: {
    likeTargetRequired() {
      if (!this.postId && !this.commentId) {
        throw new Error('Like phải có target là post hoặc comment');
      }
      if (this.postId && this.commentId) {
        throw new Error('Like chỉ có thể target post hoặc comment, không được cả hai');
      }
    }
  }
});

module.exports = Like; 