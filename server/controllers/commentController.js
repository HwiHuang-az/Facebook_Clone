const { Comment, User, Post, Like } = require('../models');
const { Op } = require('sequelize');

// Lấy comments của một post
const getPostComments = async (req, res) => {
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
        parentCommentId: null, // Chỉ lấy comment gốc, không phải reply
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
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']]
    });

    // Thêm thông tin đã like hay chưa cho comments và replies
    const commentsWithLikeStatus = comments.rows.map(comment => {
      const userLike = comment.likes.find(like => like.userId === userId);
      
      const repliesWithLikeStatus = comment.replies.map(reply => {
        const replyUserLike = reply.likes.find(like => like.userId === userId);
        return {
          ...reply.toJSON(),
          isLiked: !!replyUserLike,
          likesCount: reply.likes.length
        };
      });

      return {
        ...comment.toJSON(),
        isLiked: !!userLike,
        likesCount: comment.likes.length,
        replies: repliesWithLikeStatus
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
      message: 'Lỗi server khi lấy bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Tạo comment mới
const createComment = async (req, res) => {
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

    // Nếu là reply, kiểm tra parent comment có tồn tại không
    if (parentCommentId) {
      const parentComment = await Comment.findByPk(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận gốc'
        });
      }
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
      message: 'Lỗi server khi tạo bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cập nhật comment
const updateComment = async (req, res) => {
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

    // Lấy comment sau khi update
    const updatedComment = await Comment.findByPk(id, {
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
      message: 'Cập nhật bình luận thành công',
      data: { comment: updatedComment }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Xóa comment
const deleteComment = async (req, res) => {
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
      message: 'Lỗi server khi xóa bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Like/Unlike comment
const toggleLikeComment = async (req, res) => {
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
      message: 'Lỗi server khi thích/bỏ thích bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy replies của một comment
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // Kiểm tra parent comment có tồn tại không
    const parentComment = await Comment.findByPk(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Lấy replies
    const replies = await Comment.findAndCountAll({
      where: {
        parentCommentId: commentId,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
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
      order: [['createdAt', 'ASC']]
    });

    // Thêm thông tin đã like hay chưa
    const repliesWithLikeStatus = replies.rows.map(reply => {
      const userLike = reply.likes.find(like => like.userId === userId);
      return {
        ...reply.toJSON(),
        isLiked: !!userLike,
        likesCount: reply.likes.length
      };
    });

    res.json({
      success: true,
      data: {
        replies: repliesWithLikeStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: replies.count,
          totalPages: Math.ceil(replies.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get comment replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy phản hồi bình luận',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getCommentReplies
}; 