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
  },
  type: {
    type: DataTypes.ENUM('normal', 'profile_update', 'cover_update', 'reel'),
    defaultValue: 'normal'
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true,
    comment: 'Video duration in seconds'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count',
    comment: 'Number of video views'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(255),
    field: 'thumbnail_url',
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'posts',
  timestamps: true
});

// Instance methods
Post.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Đảm bảo frontend luôn nhận được createdAt dù Sequelize map thế nào
  if (!values.createdAt && values.created_at) {
    values.createdAt = values.created_at;
  }
  return values;
};

module.exports = Post;