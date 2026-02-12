const { BlockedUser, User } = require('../models');
const { Op } = require('sequelize');

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { userId, reason } = req.body;

    // Can't block yourself
    if (blockerId === parseInt(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot block yourself' 
      });
    }

    // Check if user exists
    const userToBlock = await User.findByPk(userId);
    if (!userToBlock) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      where: { blockerId, blockedId: userId }
    });

    if (existingBlock) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already blocked' 
      });
    }

    // Block the user
    const block = await BlockedUser.create({
      blockerId,
      blockedId: userId,
      reason: reason || null
    });

    res.status(201).json({
      success: true,
      message: 'User blocked successfully',
      data: block
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to block user',
      error: error.message 
    });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { id } = req.params;

    const block = await BlockedUser.findOne({
      where: { id, blockerId }
    });

    if (!block) {
      return res.status(404).json({ 
        success: false, 
        message: 'Block not found' 
      });
    }

    await block.destroy();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unblock user',
      error: error.message 
    });
  }
};

// Get blocked users list
exports.getBlockedUsers = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: blockedUsers } = await BlockedUser.findAndCountAll({
      where: { blockerId },
      include: [
        {
          model: User,
          as: 'blocked',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: blockedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get blocked users',
      error: error.message 
    });
  }
};

// Check if user is blocked
exports.checkBlocked = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { userId } = req.params;

    const block = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { blockerId, blockedId: userId },
          { blockerId: userId, blockedId: blockerId }
        ]
      }
    });

    res.json({
      success: true,
      isBlocked: !!block,
      blockedBy: block ? (block.blockerId === blockerId ? 'me' : 'them') : null
    });
  } catch (error) {
    console.error('Check blocked error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check blocked status',
      error: error.message 
    });
  }
};

// Helper function to check if users have blocked each other
exports.isBlocked = async (userId1, userId2) => {
  const block = await BlockedUser.findOne({
    where: {
      [Op.or]: [
        { blockerId: userId1, blockedId: userId2 },
        { blockerId: userId2, blockedId: userId1 }
      ]
    }
  });
  return !!block;
};
