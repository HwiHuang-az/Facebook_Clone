const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
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
    allowNull: false,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  parentCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_comment_id',
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nội dung comment không được để trống'
      },
      len: {
        args: [1, 2000],
        msg: 'Nội dung comment phải từ 1-2000 ký tự'
      }
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_edited'
  },
  editedAt: {
    type: DataTypes.DATE,
    field: 'edited_at'
  },
  repliesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'replies_count'
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
  tableName: 'comments',
  timestamps: true,
  indexes: [
    {
      fields: ['post_id', 'created_at']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['parent_comment_id']
    }
  ]
});

module.exports = Comment;