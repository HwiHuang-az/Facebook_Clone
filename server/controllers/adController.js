const { Ad } = require('../models');
const { Op } = require('sequelize');

// Get active ads for display
exports.getActiveAds = async (req, res) => {
  try {
    const { limit = 2 } = req.query;

    const userLocation = req.user.location;
    const where = { status: 'active' };

    // Simple targeting by location if user has one
    if (userLocation) {
      where[Op.or] = [
        { targetLocation: null },          // Global ads
        { targetLocation: { [Op.like]: `%${userLocation}%` } }
      ];
    }

    const ads = await Ad.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: ads
    });
  } catch (error) {
    console.error('Fetch ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách quảng cáo'
    });
  }
};

// Create a new ad
exports.createAd = async (req, res) => {
  try {
    const { title, description, imageUrl, targetUrl, sponsorName, targetLocation, budget, status } = req.body;

    if (!title || !imageUrl || !targetUrl || !sponsorName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu các trường bắt buộc: title, imageUrl, targetUrl, sponsorName'
      });
    }

    const ad = await Ad.create({
      title,
      description,
      imageUrl,
      targetUrl,
      sponsorName,
      targetLocation: targetLocation || null,
      budget: budget || 0,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo quảng cáo thành công',
      data: ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo quảng cáo'
    });
  }
};

// Update an ad
exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, targetUrl, sponsorName, targetLocation, budget, status } = req.body;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quảng cáo'
      });
    }

    await ad.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(targetUrl !== undefined && { targetUrl }),
      ...(sponsorName !== undefined && { sponsorName }),
      ...(targetLocation !== undefined && { targetLocation }),
      ...(budget !== undefined && { budget }),
      ...(status !== undefined && { status })
    });

    res.json({
      success: true,
      message: 'Cập nhật quảng cáo thành công',
      data: ad
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật quảng cáo'
    });
  }
};

// Delete an ad
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quảng cáo'
      });
    }

    await ad.destroy();

    res.json({
      success: true,
      message: 'Xóa quảng cáo thành công'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa quảng cáo'
    });
  }
};

// Get all ads (admin view – includes paused/completed)
exports.getAllAds = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Ad.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách quảng cáo'
    });
  }
};
