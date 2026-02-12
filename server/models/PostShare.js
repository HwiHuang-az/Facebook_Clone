const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostShare = sequelize.define('PostShare', {
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'post_id'
  },
  sharedContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'shared_content'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'post_shares',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['post_id', 'created_at']
    }
  ]
});

module.exports = PostShare;
