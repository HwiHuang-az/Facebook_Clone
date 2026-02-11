const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Post, User, Comment, Like, Friendship } = require('../models');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

// @route   GET /api/posts
// @desc    Get all posts (newsfeed)
// @access  Private
router.get('/', auth, async (req, res) => {
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

    // Thêm user hiện tại vào danh sách
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
      message: 'Lỗi server khi lấy danh sách bài viết'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, privacy = 'friends', videoUrl } = req.body;
    let imageUrl = req.body.imageUrl;

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
      message: 'Lỗi server khi tạo bài viết'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', auth, async (req, res) => {
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
      message: 'Lỗi server khi lấy bài viết'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', auth, async (req, res) => {
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

    // Cập nhật post
    await post.update({
      content,
      privacy: privacy || post.privacy,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: { post }
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài viết'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
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
      message: 'Lỗi server khi xóa bài viết'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
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
      message: 'Lỗi server khi thích/bỏ thích bài viết'
    });
  }
});

module.exports = router; 