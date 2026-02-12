const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Comment, User, Post, Like } = require('../models');
const { Op } = require('sequelize');

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
// @access  Private
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // Kiểm tra post có tồn tại không
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Lấy comments
    const comments = await Comment.findAndCountAll({
      where: {
        postId: postId,
        parentCommentId: null, // Chỉ lấy comment gốc
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
          as: 'replies',
          where: { isActive: true },
          required: false,
          limit: 3,
          order: [['created_at', 'ASC']],
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
      order: [['created_at', 'ASC']]
    });

    // Thêm thông tin đã like hay chưa
    const commentsWithLikeStatus = comments.rows.map(comment => {
      const userLike = comment.likes.find(like => like.userId === userId);
      return {
        ...comment.toJSON(),
        isLiked: !!userLike,
        likesCount: comment.likes.length
      };
    });

    res.json({
      success: true,
      data: {
        comments: commentsWithLikeStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: comments.count,
          totalPages: Math.ceil(comments.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bình luận'
    });
  }
});

// @route   POST /api/comments
// @desc    Create new comment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, content, parentCommentId } = req.body;

    // Validate input
    if (!postId || !content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    // Kiểm tra post có tồn tại không
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tạo comment mới
    const newComment = await Comment.create({
      userId,
      postId,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });

    // Lấy comment vừa tạo kèm thông tin author
    const comment = await Comment.findByPk(newComment.id, {
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
      message: 'Tạo bình luận thành công',
      data: {
        comment: {
          ...comment.toJSON(),
          isLiked: false,
          likesCount: 0,
          likes: [],
          replies: []
        }
      }
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bình luận'
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    // Tìm comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền sửa
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bình luận này'
      });
    }

    // Cập nhật comment
    await comment.update({
      content: content.trim(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Cập nhật bình luận thành công',
      data: { comment }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bình luận'
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền xóa
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    // Soft delete
    await comment.update({ isActive: false });

    // Xóa luôn các replies
    await Comment.update(
      { isActive: false },
      { where: { parentCommentId: id } }
    );

    res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bình luận'
    });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra comment có tồn tại không
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({
      where: { userId, commentId: id }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      res.json({
        success: true,
        message: 'Bỏ thích bình luận',
        data: { isLiked: false }
      });
    } else {
      // Like
      await Like.create({
        userId,
        commentId: id,
        type: 'like'
      });
      res.json({
        success: true,
        message: 'Thích bình luận',
        data: { isLiked: true }
      });
    }

  } catch (error) {
    console.error('Toggle like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thích/bỏ thích bình luận'
    });
  }
});

module.exports = router; 