const { Ad } = require('../models');

// Get active ads for display
exports.getActiveAds = async (req, res) => {
  try {
    const { limit = 2 } = req.query;

    const ads = await Ad.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']], // In real app: order by some relevance/bid score
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
