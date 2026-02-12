const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');
const { User, Post, Friendship } = require('../models');
const { Op } = require('sequelize');

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Tìm user
    const user = await User.findByPk(id, {
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'profilePicture', 
        'coverPhoto', 'bio', 'dateOfBirth', 'gender', 'location',
        'work', 'education', 'relationshipStatus', 'isVerified', 'createdAt'
      ],
      include: [
        {
          model: Post,
          as: 'posts',
          where: { isActive: true },
          required: false,
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra friendship status
    let friendshipStatus = 'none';
    if (currentUserId !== parseInt(id)) {
      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { user1Id: currentUserId, user2Id: id },
            { user1Id: id, user2Id: currentUserId }
          ]
        }
      });

      if (friendship) {
        friendshipStatus = friendship.status;
      }
    }

    res.json({
      success: true,
      data: {
        user,
        friendshipStatus,
        isOwnProfile: currentUserId === parseInt(id)
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validateProfile, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      bio,
      location,
      work,
      education,
      relationshipStatus,
      dateOfBirth
    } = req.body;

    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên không được để trống'
      });
    }

    // Cập nhật thông tin user
    await User.update(
      {
        firstName,
        lastName,
        bio,
        location,
        work,
        education,
        relationshipStatus,
        dateOfBirth
      },
      { where: { id: userId } }
    );

    // Lấy thông tin user sau khi update
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'profilePicture',
        'coverPhoto', 'bio', 'location', 'work', 'education',
        'relationshipStatus', 'dateOfBirth', 'isVerified'
      ]
    });

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
      });
    }

    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: currentUserId } },
          { isActive: true },
          {
            [Op.or]: [
              { firstName: { [Op.like]: `%${q}%` } },
              { lastName: { [Op.like]: `%${q}%` } },
              { email: { [Op.like]: `%${q}%` } }
            ]
          }
        ]
      },
      attributes: [
        'id', 'firstName', 'lastName', 'profilePicture', 'isVerified'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.count,
          totalPages: Math.ceil(users.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm người dùng'
    });
  }
});

// @route   GET /api/users/:id/friends
// @desc    Get user's friends list
// @access  Private
router.get('/:id/friends', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const friendships = await Friendship.findAndCountAll({
      where: {
        [Op.or]: [
          { user1Id: id, status: 'accepted' },
          { user2Id: id, status: 'accepted' }
        ]
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const friendIds = friendships.rows.map(friendship => {
      return friendship.user1Id === parseInt(id) ? friendship.user2Id : friendship.user1Id;
    });

    const friends = await User.findAll({
      where: { id: { [Op.in]: friendIds } },
      attributes: [
        'id', 'firstName', 'lastName', 'profilePicture', 'isVerified'
      ]
    });

    res.json({
      success: true,
      data: {
        friends,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: friendships.count,
          totalPages: Math.ceil(friendships.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bạn bè'
    });
  }
});

module.exports = router; 