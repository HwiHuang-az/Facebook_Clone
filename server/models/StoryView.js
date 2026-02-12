const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoryView = sequelize.define('StoryView', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'story_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  viewedAt: {
    type: DataTypes.DATE,
    field: 'viewed_at'
  }
}, {
  tableName: 'story_views',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['story_id', 'user_id']
    },
    {
      fields: ['story_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = StoryView;
