const Page = require('../models/Page');
const User = require('../models/User');
const { Op } = require('sequelize');

// Create a new page
exports.createPage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, category, description, profilePicture, coverPhoto, website, email, phone, address } = req.body;

    const page = await Page.create({
      name,
      category,
      description,
      profilePicture,
      coverPhoto,
      website,
      email,
      phone,
      address,
      ownerId
    });

    res.status(201).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all pages (for discovery)
exports.getPages = async (req, res) => {
  try {
    const { query, category, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (query) {
      where.name = { [Op.like]: `%${query}%` };
    }
    if (category) {
      where.category = category;
    }

    const { count, rows } = await Page.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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
    console.error('Get pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pages owned by user
exports.getMyPages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pages = await Page.findAll({
      where: { ownerId }
    });

    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get my pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single page detail
exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Get page by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update page
exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await page.update(req.body);

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete page
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await page.destroy();

    res.status(200).json({
      success: true,
      message: 'Page deleted'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
