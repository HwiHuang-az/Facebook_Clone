const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  coverPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cover_photo'
  },
  privacy: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'public'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'creator_id'
  },
  interestedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'interested_count'
  },
  goingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'going_count'
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
  tableName: 'events',
  timestamps: true,
  indexes: [
    {
      fields: ['creator_id']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['privacy']
    }
  ]
});

module.exports = Event;
