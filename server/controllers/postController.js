const { Post, User, Comment, Like, Friendship } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả posts (newsfeed)
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
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

    // Thêm user hiện tại vào danh sách để xem posts của chính mình
    friendIds.push(userId);

    // Lấy posts từ bạn bè và chính mình
    const posts = await Post.findAndCountAll({
      where: {
        userId: { [Op.in]: friendIds },
        isActive: true
      },
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
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Thêm thông tin đã like hay chưa
    const postsWithLikeStatus = posts.rows.map(post => {
      const userLike = post.likes.find(like => like.userId === userId);
      return {
        ...post.toJSON(),
        isLiked: !!userLike,
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      };
    });

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
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
    const { content, privacy = 'friends', imageUrl, videoUrl } = req.body;

    // Validate input
    if (!content && !imageUrl && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Bài viết phải có nội dung hoặc hình ảnh/video'
      });
    }

    // Tạo post mới
    const newPost = await Post.create({
      userId,
      content,
      privacy,
      imageUrl,
      videoUrl
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

    // Thêm thông tin đã like hay chưa
    const userLike = post.likes.find(like => like.userId === userId);
    const postWithLikeStatus = {
      ...post.toJSON(),
      isLiked: !!userLike,
      likesCount: post.likes.length,
      commentsCount: post.comments.length
    };

    res.json({
      success: true,
      data: { post: postWithLikeStatus }
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

    // Kiểm tra post có tồn tại không
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({
      where: { userId, postId: id }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      res.json({
        success: true,
        message: 'Bỏ thích bài viết',
        data: { isLiked: false }
      });
    } else {
      // Like
      await Like.create({
        userId,
        postId: id,
        type: 'like'
      });
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
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Thêm thông tin đã like hay chưa
    const postsWithLikeStatus = posts.rows.map(post => {
      const userLike = post.likes.find(like => like.userId === currentUserId);
      return {
        ...post.toJSON(),
        isLiked: !!userLike,
        likesCount: post.likes.length,
        commentsCount: post.comments.length
      };
    });

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
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