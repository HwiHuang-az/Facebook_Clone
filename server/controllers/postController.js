const { Post, User, Comment, Like, Friendship, BlockedUser, PrivacySetting } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('./notificationController');

// Helper to format post with detailed reaction stats
const formatPostWithStats = (post, currentUserId) => {
  const jsonPost = post.toJSON();
  const reactions = post.likes || [];
  
  // Calculate counts for each type
  const reactionStats = {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0
  };
  
  let userReaction = null;
  
  reactions.forEach(like => {
    if (reactionStats[like.type] !== undefined) {
      reactionStats[like.type]++;
    }
    if (like.userId === currentUserId) {
      userReaction = like.type;
    }
  });

  return {
    ...jsonPost,
    isLiked: !!userReaction,
    userReaction,
    reactionStats,
    likesCount: reactions.length,
    commentsCount: post.comments?.length || 0
  };
};

// Lấy tất cả posts (newsfeed)
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1, type } = req.query;
    const offset = (page - 1) * limit;

    // Lấy danh sách bạn bè
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId, status: 'accepted' },
          { user2Id: userId, status: 'accepted' }
        ]
      }
    });

    const friendIds = friendships.map(friendship => {
      return friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;
    });

    // Get blocked user IDs (both ways)
    const blocks = await BlockedUser.findAll({
      where: {
        [Op.or]: [
          { blockerId: userId },
          { blockedId: userId }
        ]
      }
    });

    const blockedUserIds = blocks.map(b =>
      b.blockerId === userId ? b.blockedId : b.blockerId
    );

    // Filter friendIds to remove blocked users
    const filteredFriendIds = friendIds.filter(id => !blockedUserIds.includes(id));

    // Thêm user hiện tại vào danh sách để xem posts của chính mình
    filteredFriendIds.push(userId);

    // Filter by type, groupId, or pageId
    const whereClause = {
        isActive: true
    };

    if (req.query.groupId) {
        whereClause.groupId = req.query.groupId;
    } else if (req.query.pageId) {
        whereClause.pageId = req.query.pageId;
    } else {
        // Default newsfeed: posts from friends/public and NOT in groups/pages
        whereClause[Op.and] = [
            {
                [Op.or]: [
                    { userId: { [Op.in]: filteredFriendIds } },
                    {
                        privacy: 'public',
                        userId: { [Op.notIn]: blockedUserIds }
                    }
                ]
            },
            { groupId: null },
            { pageId: null }
        ];
    }

    if (type) {
        whereClause.type = type;
    }

    // Lấy posts từ bạn bè và chính mình
    const posts = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Comment,
          as: 'comments',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Post,
          as: 'sharedPost',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Đính kèm sharedPost vào result nếu cần (đã include trong query trên)

    // Thêm thông tin đã like hay chưa và stats
    const postsWithStats = posts.rows.map(post => formatPostWithStats(post, userId));

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: posts.count,
          totalPages: Math.ceil(posts.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Tạo post mới
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, privacy, videoUrl, type, groupId, pageId } = req.body;
    let { imageUrl } = req.body;

    // Nếu có file upload từ multer
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Validate input
    if (!content && !imageUrl && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Bài viết phải có nội dung hoặc hình ảnh/video'
      });
    }

    // Get user's default privacy if not provided
    let finalPrivacy = privacy;
    if (!privacy) {
      const settings = await PrivacySetting.findOne({ where: { userId } });
      if (settings) {
        finalPrivacy = settings.postDefaultPrivacy;
      } else {
        finalPrivacy = 'friends'; // Fallback
      }
    }

    // Tạo post mới
    const newPost = await Post.create({
      userId,
      content,
      privacy: finalPrivacy,
      imageUrl,
      videoUrl,
      groupId: groupId || null,
      pageId: pageId || null,
      type: type || 'normal'
    });

    // Lấy post vừa tạo kèm thông tin author
    const post = await Post.findByPk(newPost.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: {
        post: {
          ...post.toJSON(),
          isLiked: false,
          userReaction: null,
          reactionStats: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
          likesCount: 0,
          commentsCount: 0,
          likes: [],
          comments: []
        }
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy một post cụ thể
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Comment,
          as: 'comments',
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            },
            {
              model: Like,
              as: 'likes',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName']
                }
              ]
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Post,
          as: 'sharedPost',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền xem post
    if (post.privacy === 'private' && post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài viết này'
      });
    }

    if (post.privacy === 'friends' && post.userId !== userId) {
      // Kiểm tra friendship
      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: post.userId, status: 'accepted' },
            { user1Id: post.userId, user2Id: userId, status: 'accepted' }
          ]
        }
      });

      if (!friendship) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem bài viết này'
        });
      }
    }

    // Thêm thông tin stats
    const postWithStats = formatPostWithStats(post, userId);

    res.json({
      success: true,
      data: { post: postWithStats }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cập nhật post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, privacy } = req.body;

    // Tìm post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền sửa
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bài viết này'
      });
    }

    // Validate input
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bài viết không được để trống'
      });
    }

    // Cập nhật post
    await post.update({
      content,
      privacy: privacy || post.privacy,
      updatedAt: new Date()
    });

    // Lấy post sau khi update
    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: { post: updatedPost }
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Xóa post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền xóa
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }

    // Soft delete
    await post.update({ isActive: false });

    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Like/Unlike post
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type = 'like' } = req.body;

    // Kiểm tra post có tồn tại không
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra đã phản ứng chưa
    const existingLike = await Like.findOne({
      where: { userId, postId: id }
    });

    if (existingLike) {
      if (existingLike.type === type) {
        // Nếu cùng loại thì bỏ thích (Unlike)
        await existingLike.destroy();
        return res.json({
          success: true,
          message: 'Bỏ phản ứng bài viết',
          data: { isLiked: false, type: null }
        });
      } else {
        // Nếu khác loại thì cập nhật loại phản ứng
        await existingLike.update({ type });
        return res.json({
          success: true,
          message: 'Cập nhật phản ứng bài viết',
          data: { isLiked: true, type }
        });
      }
    } else {
      // Create new reaction
      await Like.create({
        userId,
        postId: id,
        type
      });

      // Notify post author
      if (post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          fromUserId: userId,
          type: 'like',
          postId: post.id,
          message: 'đã thích bài viết của bạn'
        });
      }

      res.json({
        success: true,
        message: 'Thích bài viết',
        data: { isLiked: true }
      });

    }

  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thích/bỏ thích bài viết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy posts của một user cụ thể
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Kiểm tra quyền xem posts
    let whereCondition = {
      userId: userId,
      isActive: true
    };

    if (currentUserId !== parseInt(userId)) {
      // Kiểm tra friendship nếu không phải chính mình
      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { user1Id: currentUserId, user2Id: userId, status: 'accepted' },
            { user1Id: userId, user2Id: currentUserId, status: 'accepted' }
          ]
        }
      });

      if (friendship) {
        // Là bạn bè -> có thể xem posts friends và public
        whereCondition.privacy = { [Op.in]: ['public', 'friends'] };
      } else {
        // Không phải bạn bè -> chỉ xem được posts public
        whereCondition.privacy = 'public';
      }
    }

    const posts = await Post.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Comment,
          as: 'comments',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Post,
          as: 'sharedPost',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Thêm thông tin stats
    const postsWithStats = posts.rows.map(post => formatPostWithStats(post, currentUserId));

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: posts.count,
          totalPages: Math.ceil(posts.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết của người dùng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getUserPosts
}; 