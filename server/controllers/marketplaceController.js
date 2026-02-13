const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');
const { Op } = require('sequelize');

// Create new marketplace item
exports.createItem = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { title, description, price, category, conditionItem, location, images } = req.body;

    const item = await MarketplaceItem.create({
      title,
      description,
      price,
      category,
      conditionItem,
      location,
      images,
      sellerId
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all marketplace items (with filtering)
exports.getItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, query, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isSold: false };

    if (category) where.category = category;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }

    const { count, rows } = await MarketplaceItem.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single item detail
exports.getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'createdAt']
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment views
    await item.increment('views_count');

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.update(req.body);

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Update marketplace item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: 'Item deleted'
    });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
