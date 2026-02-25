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
    field: 'user_id', // ← Thêm dòng này
    references: {
      model: 'users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'post_id', // ← Thêm dòng này
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'comment_id', // ← Thêm dòng này
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  pageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'page_id',
    references: {
      model: 'pages',
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
  createdAt: 'created_at', // ← Sửa thành snake_case
  updatedAt: false, // ← SQL không có updatedAt cho bảng likes
  indexes: [
    {
      fields: ['user_id'] // ← Sửa lại indexes
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
      name: 'unique_post_like' // Khớp với SQL
    },
    {
      fields: ['user_id', 'comment_id'],
      unique: true,
      name: 'unique_comment_like' // Khớp với SQL
    },
    {
      fields: ['user_id', 'page_id'],
      unique: true,
      name: 'unique_page_like'
    }
  ],
  validate: {
    likeTargetRequired() {
      if (!this.postId && !this.commentId && !this.pageId) {
        throw new Error('Like phải có target là post, comment hoặc page');
      }
      const targets = [this.postId, this.commentId, this.pageId].filter(Boolean);
      if (targets.length > 1) {
        throw new Error('Like chỉ có thể target 1 loại đối tượng duy nhất');
      }
    }
  }
});

module.exports = Like;