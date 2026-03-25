const { User, Post, Group, Page, MarketplaceItem, Event, BlockedUser, RecentSearch } = require('../models');
const { Op } = require('sequelize');

exports.unifiedSearch = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10, page = 1 } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
      });
    }

    // Save search history (fire and forget)
    RecentSearch.upsert({
      userId: currentUserId,
      query: q.trim().toLowerCase(),
      createdAt: new Date()
    }).catch(err => console.error('Save search history error:', err));

    // Get blocked user IDs (both ways)
    const blocks = await BlockedUser.findAll({
      where: {
        [Op.or]: [
          { blockerId: currentUserId },
          { blockedId: currentUserId }
        ]
      }
    });

    const blockedUserIds = blocks.map(b => 
      b.blockerId === currentUserId ? b.blockedId : b.blockerId
    );

    const offset = (page - 1) * limit;
    const results = {};

    // Helper to search Users
    const searchUsers = async () => {
      return await User.findAndCountAll({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: currentUserId } },
            { id: { [Op.notIn]: blockedUserIds } },
            { isActive: true },
            {
              [Op.or]: [
                { firstName: { [Op.like]: `%${q}%` } },
                { lastName: { [Op.like]: `%${q}%` } }
              ]
            }
          ]
        },
        attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    };

    // Helper to search Posts
    const searchPosts = async () => {
      return await Post.findAndCountAll({
        where: {
          isActive: true,
          content: { [Op.like]: `%${q}%` },
          privacy: 'public',
          userId: { [Op.notIn]: blockedUserIds }
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
    };

    // Helper to search Groups
    const searchGroups = async () => {
      return await Group.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ],
          privacy: 'public'
        },
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    };

    // Helper to search Pages
    const searchPages = async () => {
      return await Page.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    };

    if (type === 'all' || type === 'users') results.users = await searchUsers();
    if (type === 'all' || type === 'posts') results.posts = await searchPosts();
    if (type === 'all' || type === 'groups') results.groups = await searchGroups();
    if (type === 'all' || type === 'pages') results.pages = await searchPages();

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm',
      error: error.message
    });
  }
};

exports.getRecentSearches = async (req, res) => {
  try {
    const userId = req.user.id;
    const searches = await RecentSearch.findAll({
      where: { userId },
      attributes: ['id', 'query', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({ success: false });
  }
};

exports.deleteRecentSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await RecentSearch.destroy({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Đã xóa lịch sử tìm kiếm' });
  } catch (error) {
    console.error('Delete search history error:', error);
    res.status(500).json({ success: false });
  }
};

exports.clearRecentSearches = async (req, res) => {
  try {
    const userId = req.user.id;

    await RecentSearch.destroy({
      where: { userId }
    });

    res.json({ success: true, message: 'Đã xóa tất cả lịch sử tìm kiếm' });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ success: false });
  }
};
