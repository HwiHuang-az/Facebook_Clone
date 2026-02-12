const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Migration = sequelize.define('Migration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  batch: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  executedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'executed_at'
  }
}, {
  tableName: 'migrations',
  timestamps: false
});

module.exports = Migration;
