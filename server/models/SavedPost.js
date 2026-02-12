const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavedPost = sequelize.define('SavedPost', {
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
  collectionName: {
    type: DataTypes.STRING(100),
    defaultValue: 'Saved Items',
    field: 'collection_name'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'saved_posts',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'post_id']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['user_id', 'collection_name']
    }
  ]
});

module.exports = SavedPost;
