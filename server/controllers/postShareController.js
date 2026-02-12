const { PostShare, Post, User } = require('../models');
const { Op } = require('sequelize');

// Share a post
exports.sharePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { sharedContent } = req.body;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Create share
    const share = await PostShare.create({
      userId,
      postId,
      sharedContent: sharedContent || ''
    });

    // Increment shares count on original post
    await post.increment('sharesCount');

    // Get share with details
    const shareWithDetails = await PostShare.findByPk(share.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Post,
          as: 'post',
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

    res.status(201).json({
      success: true,
      message: 'Post shared successfully',
      data: shareWithDetails
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to share post',
      error: error.message 
    });
  }
};

// Get shares of a post
exports.getPostShares = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: shares } = await PostShare.findAndCountAll({
      where: { postId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: shares,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get post shares error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get shares',
      error: error.message 
    });
  }
};

// Get user's shared posts
exports.getUserShares = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: shares } = await PostShare.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: shares,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user shares error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user shares',
      error: error.message 
    });
  }
};

// Delete a share
exports.deleteShare = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const share = await PostShare.findOne({
      where: { id, userId }
    });

    if (!share) {
      return res.status(404).json({ 
        success: false, 
        message: 'Share not found' 
      });
    }

    // Decrement shares count on original post
    const post = await Post.findByPk(share.postId);
    if (post && post.sharesCount > 0) {
      await post.decrement('sharesCount');
    }

    await share.destroy();

    res.json({
      success: true,
      message: 'Share deleted successfully'
    });
  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete share',
      error: error.message 
    });
  }
};
