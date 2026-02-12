const { User, Friendship, Notification } = require('../models');
const { Op } = require('sequelize');

// Gửi lời mời kết bạn
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    // Validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID người nhận'
      });
    }

    // Kiểm tra không thể gửi request cho chính mình
    if (senderId === parseInt(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể gửi lời mời kết bạn cho chính mình'
      });
    }

    // Kiểm tra receiver có tồn tại không
    const receiver = await User.findByPk(receiverId);
    if (!receiver || !receiver.isActive) {
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
      } else if (existingFriendship.status === 'blocked') {
        return res.status(400).json({
          success: false,
          message: 'Không thể gửi lời mời kết bạn'
        });
      }
    }

    // Tạo friend request
    const friendship = await Friendship.create({
      user1Id: senderId,
      user2Id: receiverId,
      status: 'pending',
      initiatedBy: senderId
    });

    // Tạo notification cho receiver
    await Notification.create({
      userId: receiverId,
      fromUserId: senderId,
      type: 'friend_request',
      title: 'Lời mời kết bạn',
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
      message: 'Lỗi server khi gửi lời mời kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Chấp nhận lời mời kết bạn
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.body;

    if (!friendshipId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID lời mời kết bạn'
      });
    }

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
    await friendship.update({ 
      status: 'accepted',
      acceptedAt: new Date()
    });

    // Tạo notification cho sender
    await Notification.create({
      userId: friendship.user1Id,
      fromUserId: userId,
      type: 'friend_accept',
      title: 'Chấp nhận kết bạn',
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
      message: 'Lỗi server khi chấp nhận lời mời kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Từ chối lời mời kết bạn
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.body;

    if (!friendshipId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID lời mời kết bạn'
      });
    }

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
      message: 'Lỗi server khi từ chối lời mời kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Hủy kết bạn
const unfriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID bạn bè'
      });
    }

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
      message: 'Lỗi server khi hủy kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách lời mời kết bạn đến
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const requests = await Friendship.findAndCountAll({
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
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        requests: requests.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: requests.count,
          totalPages: Math.ceil(requests.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lời mời kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách bạn bè
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      status: 'accepted'
    };

    const friends = await Friendship.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
          required: false
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
          required: false
        }
      ],
      order: [['accepted_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format dữ liệu để trả về thông tin bạn bè
    const formattedFriends = friends.rows.map(friendship => {
      const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
      return {
        friendshipId: friendship.id,
        friend,
        acceptedAt: friendship.acceptedAt,
        createdAt: friendship.createdAt
      };
    }).filter(item => item.friend); // Lọc bỏ những friendship không có thông tin user

    // Lọc theo search nếu có
    const filteredFriends = search ? 
      formattedFriends.filter(item => 
        item.friend.firstName.toLowerCase().includes(search.toLowerCase()) ||
        item.friend.lastName.toLowerCase().includes(search.toLowerCase())
      ) : formattedFriends;

    res.json({
      success: true,
      data: {
        friends: filteredFriends,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredFriends.length,
          totalPages: Math.ceil(filteredFriends.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bạn bè',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy gợi ý kết bạn
const getFriendSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Lấy danh sách ID bạn bè hiện tại và pending requests
    const existingFriendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      attributes: ['user1Id', 'user2Id']
    });

    const excludeIds = new Set();
    existingFriendships.forEach(friendship => {
      if (friendship.user1Id === userId) {
        excludeIds.add(friendship.user2Id);
      } else {
        excludeIds.add(friendship.user1Id);
      }
    });
    excludeIds.add(userId); // Thêm chính mình

    // Tìm users không phải bạn bè
    const suggestions = await User.findAll({
      where: {
        id: { [Op.notIn]: Array.from(excludeIds) },
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified'],
      limit: parseInt(limit),
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy gợi ý kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kiểm tra trạng thái kết bạn với user khác
const getFriendshipStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === parseInt(targetUserId)) {
      return res.json({
        success: true,
        data: { status: 'self' }
      });
    }

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId }
        ]
      }
    });

    let status = 'none';
    let canSendRequest = true;
    let friendshipId = null;

    if (friendship) {
      status = friendship.status;
      friendshipId = friendship.id;
      canSendRequest = false;
      
      if (friendship.status === 'pending') {
        // Kiểm tra ai là người gửi request
        if (friendship.user1Id === userId) {
          status = 'sent';
        } else {
          status = 'received';
        }
      }
    }

    res.json({
      success: true,
      data: {
        status,
        canSendRequest,
        friendshipId
      }
    });

  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra trạng thái kết bạn',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getFriendRequests,
  getFriends,
  getFriendSuggestions,
  getFriendshipStatus
}; 