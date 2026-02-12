const { SavedPost, Post, User } = require('../models');
const { Op } = require('sequelize');

// Save a post
exports.savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, collectionName } = req.body;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if already saved
    const existingSave = await SavedPost.findOne({
      where: { userId, postId }
    });

    if (existingSave) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post already saved' 
      });
    }

    // Save the post
    const savedPost = await SavedPost.create({
      userId,
      postId,
      collectionName: collectionName || 'Saved Items'
    });

    res.status(201).json({
      success: true,
      message: 'Post saved successfully',
      data: savedPost
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save post',
      error: error.message 
    });
  }
};

// Get all saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collection, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    if (collection) {
      whereClause.collectionName = collection;
    }

    const { count, rows: savedPosts } = await SavedPost.findAndCountAll({
      where: whereClause,
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
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: savedPosts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get saved posts',
      error: error.message 
    });
  }
};

// Get collections
exports.getCollections = async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await SavedPost.findAll({
      where: { userId },
      attributes: [
        'collectionName',
        [SavedPost.sequelize.fn('COUNT', SavedPost.sequelize.col('id')), 'count']
      ],
      group: ['collectionName'],
      raw: true
    });

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get collections',
      error: error.message 
    });
  }
};

// Unsave a post
exports.unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const savedPost = await SavedPost.findOne({
      where: { id, userId }
    });

    if (!savedPost) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved post not found' 
      });
    }

    await savedPost.destroy();

    res.json({
      success: true,
      message: 'Post unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsave post',
      error: error.message 
    });
  }
};

// Check if post is saved
exports.checkSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const savedPost = await SavedPost.findOne({
      where: { userId, postId }
    });

    res.json({
      success: true,
      isSaved: !!savedPost,
      data: savedPost
    });
  } catch (error) {
    console.error('Check saved error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check saved status',
      error: error.message 
    });
  }
};
