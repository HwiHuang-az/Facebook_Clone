const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Friendship, User, Notification } = require('../models');
const { Op } = require('sequelize');

// @route   POST /api/friendships/send-request
// @desc    Send friend request
// @access  Private
router.post('/send-request', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    // Kiểm tra không thể gửi request cho chính mình
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể gửi lời mời kết bạn cho chính mình'
      });
    }

    // Kiểm tra receiver có tồn tại không
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra đã có friendship chưa
    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Các bạn đã là bạn bè'
        });
      } else if (existingFriendship.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Lời mời kết bạn đã được gửi trước đó'
        });
      }
    }

    // Tạo friend request
    const friendship = await Friendship.create({
      user1Id: senderId,
      user2Id: receiverId,
      status: 'pending'
    });

    // Tạo notification cho receiver
    await Notification.create({
      userId: receiverId,
      fromUserId: senderId,
      type: 'friend_request',
      message: 'đã gửi lời mời kết bạn',
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Gửi lời mời kết bạn thành công',
      data: { friendship }
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi lời mời kết bạn'
    });
  }
});

// @route   POST /api/friendships/accept-request
// @desc    Accept friend request
// @access  Private
router.post('/accept-request', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.body;

    // Tìm friendship
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lời mời kết bạn'
      });
    }

    // Kiểm tra quyền accept (phải là receiver)
    if (friendship.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấp nhận lời mời này'
      });
    }

    // Kiểm tra status
    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Lời mời kết bạn không hợp lệ'
      });
    }

    // Cập nhật status
    await friendship.update({ status: 'accepted' });

    // Tạo notification cho sender
    await Notification.create({
      userId: friendship.user1Id,
      fromUserId: userId,
      type: 'friend_accept',
      message: 'đã chấp nhận lời mời kết bạn',
      isRead: false
    });

    res.json({
      success: true,
      message: 'Chấp nhận lời mời kết bạn thành công',
      data: { friendship }
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi chấp nhận lời mời kết bạn'
    });
  }
});

// @route   POST /api/friendships/reject-request
// @desc    Reject friend request
// @access  Private
router.post('/reject-request', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.body;

    // Tìm friendship
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lời mời kết bạn'
      });
    }

    // Kiểm tra quyền reject (phải là receiver)
    if (friendship.user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền từ chối lời mời này'
      });
    }

    // Xóa friendship
    await friendship.destroy();

    res.json({
      success: true,
      message: 'Từ chối lời mời kết bạn thành công'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi từ chối lời mời kết bạn'
    });
  }
});

// @route   DELETE /api/friendships/unfriend
// @desc    Unfriend
// @access  Private
router.delete('/unfriend', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    // Tìm friendship
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId }
        ],
        status: 'accepted'
      }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mối quan hệ bạn bè'
      });
    }

    // Xóa friendship
    await friendship.destroy();

    res.json({
      success: true,
      message: 'Hủy kết bạn thành công'
    });

  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy kết bạn'
    });
  }
});

// @route   GET /api/friendships/requests
// @desc    Get friend requests (received)
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const friendRequests = await Friendship.findAll({
      where: {
        user2Id: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { requests: friendRequests }
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lời mời kết bạn'
    });
  }
});

// @route   GET /api/friendships/sent-requests
// @desc    Get sent friend requests
// @access  Private
router.get('/sent-requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const sentRequests = await Friendship.findAndCountAll({
      where: {
        user1Id: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user2', // receiver
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        requests: sentRequests.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: sentRequests.count,
          totalPages: Math.ceil(sentRequests.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lời mời đã gửi'
    });
  }
});

// @route   GET /api/friendships/suggestions
// @desc    Get friend suggestions
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Lấy danh sách user đã kết bạn hoặc có pending request
    const existingConnections = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      attributes: ['user1Id', 'user2Id']
    });

    const connectedUserIds = new Set();
    existingConnections.forEach(conn => {
      connectedUserIds.add(conn.user1Id);
      connectedUserIds.add(conn.user2Id);
    });
    connectedUserIds.add(userId); // Thêm chính mình

    // Lấy user suggestions (những người chưa kết bạn)
    const suggestions = await User.findAll({
      where: {
        id: { [Op.notIn]: Array.from(connectedUserIds) },
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy gợi ý kết bạn'
    });
  }
});

module.exports = router; 