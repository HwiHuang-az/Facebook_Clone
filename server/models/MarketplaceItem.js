const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketplaceItem = sequelize.define('MarketplaceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'VND'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  conditionItem: {
    type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    defaultValue: 'good',
    field: 'condition_item'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seller_id'
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_sold'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count'
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
  tableName: 'marketplace_items',
  timestamps: true,
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['category', 'is_sold']
    },
    {
      fields: ['location']
    },
    {
      fields: ['price']
    }
  ]
});

module.exports = MarketplaceItem;
