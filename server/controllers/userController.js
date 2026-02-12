const { User, Post, Friendship, PrivacySetting } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

// Lấy thông tin profile của user
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Tìm user
    const user = await User.findByPk(id, {
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'profilePicture', 
        'coverPhoto', 'bio', 'dateOfBirth', 'gender', 'location',
        'work', 'education', 'relationshipStatus', 'isVerified', ['created_at', 'createdAt']
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

    // Kiểm tra quyền truy cập profile
    let canViewProfile = true;
    let friendshipStatus = 'none';

    if (currentUserId !== parseInt(id)) {
      // Kiểm tra privacy settings
      const privacySetting = await PrivacySetting.findOne({
        where: { userId: id }
      });

      // Kiểm tra friendship status
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

      // Kiểm tra quyền xem profile
      if (privacySetting && privacySetting.profileVisibility === 'friends_only') {
        canViewProfile = friendshipStatus === 'accepted';
      }
    }

    if (!canViewProfile) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem profile này'
      });
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
      message: 'Lỗi server khi lấy thông tin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
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
    const updatedUser = await User.update(
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
      {
        where: { id: userId },
        returning: true
      }
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
      message: 'Lỗi server khi cập nhật profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Tìm kiếm users
const searchUsers = async (req, res) => {
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

    // Lấy friendship status cho mỗi user
    const userIds = users.rows.map(user => user.id);
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: currentUserId, user2Id: { [Op.in]: userIds } },
          { user1Id: { [Op.in]: userIds }, user2Id: currentUserId }
        ]
      }
    });

    // Map friendship status
    const usersWithFriendship = users.rows.map(user => {
      const friendship = friendships.find(f => 
        (f.user1Id === currentUserId && f.user2Id === user.id) ||
        (f.user1Id === user.id && f.user2Id === currentUserId)
      );

      return {
        ...user.toJSON(),
        friendshipStatus: friendship ? friendship.status : 'none'
      };
    });

    res.json({
      success: true,
      data: {
        users: usersWithFriendship,
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
      message: 'Lỗi server khi tìm kiếm người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách bạn bè
const getFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const currentUserId = req.user.id;

    const offset = (page - 1) * limit;

    // Lấy danh sách friendship với status = 'accepted'
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

    // Lấy thông tin chi tiết của bạn bè
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
      message: 'Lỗi server khi lấy danh sách bạn bè',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload ảnh đại diện
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    // Cập nhật đường dẫn ảnh đại diện (lấy từ Cloudinary)
    const profilePicturePath = req.file.path;
    
    await User.update(
      { profilePicture: profilePicturePath },
      { where: { id: userId } }
    );

    // Tự động đăng bài timeline
    await Post.create({
      userId,
      content: 'đã cập nhật ảnh đại diện của mình.',
      imageUrl: profilePicturePath,
      type: 'profile_update',
      privacy: 'public'
    });

    res.json({
      success: true,
      message: 'Upload ảnh đại diện thành công',
      data: {
        profilePicture: profilePicturePath
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh đại diện',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload ảnh bìa
const uploadCoverPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    // Cập nhật đường dẫn ảnh bìa (lấy từ Cloudinary)
    const coverPhotoPath = req.file.path;
    
    await User.update(
      { coverPhoto: coverPhotoPath },
      { where: { id: userId } }
    );

    // Tự động đăng bài timeline
    await Post.create({
      userId,
      content: 'đã cập nhật ảnh bìa của mình.',
      imageUrl: coverPhotoPath,
      type: 'cover_update',
      privacy: 'public'
    });

    res.json({
      success: true,
      message: 'Upload ảnh bìa thành công',
      data: {
        coverPhoto: coverPhotoPath
      }
    });

  } catch (error) {
    console.error('Upload cover photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh bìa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy tất cả ảnh của user từ các post
const getUserPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const posts = await Post.findAll({
      where: {
        userId: id,
        imageUrl: { [Op.ne]: null },
        isActive: true
      },
      attributes: ['imageUrl', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    const photos = posts.map(p => ({
      url: p.imageUrl,
      createdAt: p.created_at
    }));

    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy ảnh'
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  searchUsers,
  getFriends,
  uploadProfilePicture,
  uploadCoverPhoto,
  getUserPhotos
};