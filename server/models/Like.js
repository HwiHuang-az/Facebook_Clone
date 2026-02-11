const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
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
  type: {
    type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'),
    defaultValue: 'like'
  }
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['post_id']
    },
    {
      fields: ['comment_id']
    },
    {
      fields: ['user_id', 'post_id'],
      unique: true,
      name: 'unique_post_like'
    },
    {
      fields: ['user_id', 'comment_id'],
      unique: true,
      name: 'unique_comment_like'
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