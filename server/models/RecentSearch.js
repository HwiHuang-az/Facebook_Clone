const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RecentSearch = sequelize.define('RecentSearch', {
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
  query: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'recent_searches',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'query'],
      unique: true
    }
  ]
});

module.exports = RecentSearch;
