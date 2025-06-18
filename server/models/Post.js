const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
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
  content: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    field: 'video_url'
  },
  privacy: {
    type: DataTypes.ENUM('public', 'friends', 'only_me'),
    defaultValue: 'public'
  },
  location: {
    type: DataTypes.STRING(100)
  },
  feeling: {
    type: DataTypes.STRING(50)
  },
  activity: {
    type: DataTypes.STRING(50)
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count'
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'comments_count'
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'shares_count'
  }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Post; 