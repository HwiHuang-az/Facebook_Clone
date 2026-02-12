const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url'
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'video_url'
  },
  backgroundColor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    field: 'background_color'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'stories',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['expires_at']
    }
  ]
});

module.exports = Story;
