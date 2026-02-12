const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventResponse = sequelize.define('EventResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  response: {
    type: DataTypes.ENUM('going', 'interested', 'not_going'),
    allowNull: false
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
  tableName: 'event_responses',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'user_id']
    },
    {
      fields: ['event_id', 'response']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = EventResponse;
