const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'reporter_id'
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reported_user_id'
  },
  reportedPostId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reported_post_id'
  },
  reportedCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reported_comment_id'
  },
  reportType: {
    type: DataTypes.ENUM('spam', 'harassment', 'fake_news', 'inappropriate_content', 'violence', 'other'),
    allowNull: false,
    field: 'report_type'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending'
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
  tableName: 'reports',
  timestamps: true,
  indexes: [
    {
      fields: ['reporter_id']
    },
    {
      fields: ['status', 'created_at']
    },
    {
      fields: ['report_type']
    }
  ]
});

module.exports = Report;
