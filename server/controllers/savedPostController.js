const { SavedPost, Post, User, MarketplaceItem } = require('../models');
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

// Save a marketplace item
exports.saveMarketplaceItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { marketplaceItemId, collectionName } = req.body;

    const item = await MarketplaceItem.findByPk(marketplaceItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const existingSave = await SavedPost.findOne({
      where: { userId, marketplaceItemId }
    });

    if (existingSave) {
      return res.status(400).json({ success: false, message: 'Item already saved' });
    }

    const savedItem = await SavedPost.create({
      userId,
      marketplaceItemId,
      collectionName: collectionName || 'Saved Items'
    });

    res.status(201).json({
      success: true,
      message: 'Item saved successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Save item error:', error);
    res.status(500).json({ success: false, message: 'Failed to save item' });
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
        },
        {
          model: MarketplaceItem,
          as: 'marketplaceItem',
          include: [
            {
              model: User,
              as: 'seller',
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

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    // Check if collection already exists
    const existing = await SavedPost.findOne({
      where: { userId, collectionName: name.trim() }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Collection already exists'
      });
    }

    // Create a placeholder entry to register the collection name
    await SavedPost.create({
      userId,
      postId: null,
      collectionName: name.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: { collectionName: name.trim(), count: 0 }
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collection',
      error: error.message
    });
  }
};

// Update collection name
exports.updateCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldName, newName } = req.body;

    if (!oldName || !newName || !newName.trim()) {
      return res.status(400).json({ success: false, message: 'Both old and new names are required' });
    }

    await SavedPost.update(
      { collectionName: newName.trim() },
      { where: { userId, collectionName: oldName } }
    );

    res.json({ success: true, message: 'Collection renamed successfully' });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ success: false, message: 'Failed to update collection' });
  }
};

// Delete a collection
exports.deleteCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.params;
    const { deleteItems = false } = req.query;

    if (deleteItems === 'true' || deleteItems === true) {
      await SavedPost.destroy({ where: { userId, collectionName: name } });
    } else {
      // Move to default collection
      await SavedPost.update(
        { collectionName: 'Saved Items' },
        { where: { userId, collectionName: name } }
      );
      // If we move items, we might have duplicate (postId + userId + 'Saved Items')
      // For now, let's just delete the placeholder if it exists and keep it simple.
    }

    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete collection' });
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

// Check if post or item is saved
exports.checkSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, marketplaceItemId } = req.params;

    let savedPost = null;
    let savedItem = null;

    if (postId) {
      savedPost = await SavedPost.findOne({
        where: { userId, postId }
      });
    }

    if (marketplaceItemId) {
      savedItem = await SavedPost.findOne({
        where: { userId, marketplaceItemId }
      });
    }

    res.json({
      success: true,
      isSaved: !!savedPost || !!savedItem,
      data: savedPost || savedItem
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
