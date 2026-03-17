const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url',
    allowNull: false
  },
  targetUrl: {
    type: DataTypes.STRING(255),
    field: 'target_url',
    allowNull: false
  },
  sponsorName: {
    type: DataTypes.STRING(100),
    field: 'sponsor_name',
    allowNull: false
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed'),
    defaultValue: 'active'
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
  tableName: 'ads',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    }
  ]
});

module.exports = Ad;
