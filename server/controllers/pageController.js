const Page = require('../models/Page');
const User = require('../models/User');
const Post = require('../models/Post');
const { Op } = require('sequelize');

// Create a new page
exports.createPage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, category, description, website, email, phone, address } = req.body;
    let { profilePicture, coverPhoto } = req.body;

    // Handle file upload if present
    if (req.file) {
      profilePicture = req.file.path;
    }

    const page = await Page.create({
      name,
      category,
      description,
      profilePicture,
      coverPhoto,
      website,
      email,
      phone,
      address,
      ownerId,
      likesCount: 1, // Initialize with 1 like from owner
      followersCount: 1 // Initialize with 1 follower from owner
    });

    // Automatically like for the owner
    const Like = require('../models/Like');
    await Like.create({
      pageId: page.id,
      userId: ownerId,
      type: 'like'
    });

    res.status(201).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all pages (for discovery)
exports.getPages = async (req, res) => {
  try {
    const { query, category, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (query) {
      where.name = { [Op.like]: `%${query}%` };
    }
    if (category) {
      where.category = category;
    }

    const { count, rows } = await Page.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pages liked by user
exports.getLikedPages = async (req, res) => {
  try {
    const userId = req.user.id;
    const Like = require('../models/Like');
    
    const { query } = req.query;
    const where = { 
        userId,
        pageId: { [Op.ne]: null }
    };

    const include = [
        {
            model: Page,
            as: 'page',
            required: true
        }
    ];

    if (query) {
        include[0].where = {
            name: { [Op.like]: `%${query}%` }
        };
    }
    
    const likedPages = await Like.findAll({
        where,
        include,
        order: [['createdAt', 'DESC']]
    });

    const pages = likedPages.map(l => l.page).filter(p => p !== null);

    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get liked pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pages owned by user
exports.getMyPages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { query } = req.query;
    const where = { ownerId };
    
    if (query) {
      where.name = { [Op.like]: `%${query}%` };
    }

    const pages = await Page.findAll({
      where
    });

    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get my pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single page detail
exports.getPageById = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = await Page.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    // Check if user likes this page
    const Like = require('../models/Like');
    const like = await Like.findOne({
      where: { pageId: page.id, userId }
    });

    const pageData = page.toJSON();
    pageData.isLiked = !!like;

    res.status(200).json({
      success: true,
      data: pageData
    });
  } catch (error) {
    console.error('Get page by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle like page
exports.toggleLikePage = async (req, res) => {
  try {
    const userId = req.user.id;
    const pageId = req.params.id;
    const Like = require('../models/Like');

    const page = await Page.findByPk(pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const existingLike = await Like.findOne({
      where: { pageId, userId }
    });

    if (existingLike) {
      await existingLike.destroy();
      await page.decrement('likesCount');
      res.status(200).json({ success: true, message: 'Unliked page', isLiked: false });
    } else {
      await Like.create({ pageId, userId, type: 'like' });
      await page.increment('likesCount');
      res.status(200).json({ success: true, message: 'Liked page', isLiked: true });
    }
  } catch (error) {
    console.error('Toggle like page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update page
exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await page.update(req.body);

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete page
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await page.destroy();

    res.status(200).json({
      success: true,
      message: 'Page deleted'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Update page cover photo
exports.updatePageCover = async (req, res) => {
  try {
    const pageId = req.params.id;
    const page = await Page.findByPk(pageId);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    page.coverPhoto = req.file.path;
    await page.save();

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Update page cover error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update page profile picture
exports.updatePageProfile = async (req, res) => {
  try {
    const pageId = req.params.id;
    const page = await Page.findByPk(pageId);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    page.profilePicture = req.file.path;
    await page.save();

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Update page profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get page members (users who like the page)
exports.getPageMembers = async (req, res) => {
  try {
    const pageId = req.params.id;
    const Like = require('../models/Like');
    
    const likes = await Like.findAll({
      where: { pageId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'work', 'education']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Check friendship status
    const currentUserId = req.user.id;
    const Friendship = require('../models/Friendship');
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ],
        status: 'accepted'
      }
    });

    const friendIds = friendships.map(f => f.user1Id === currentUserId ? f.user2Id : f.user1Id);

    const likesWithFriendship = likes.map(like => {
      const likeJson = like.toJSON();
      likeJson.isFriend = friendIds.includes(like.userId);
      return likeJson;
    });

    res.status(200).json({
      success: true,
      data: likesWithFriendship
    });
  } catch (error) {
    console.error('Get page members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPageMedia = async (req, res) => {
  try {
    const pageId = req.params.id;
    const { type, page = 1, limit = 20 } = req.query; // type: 'image' or 'video'
    const offset = (page - 1) * limit;

    const where = {
      pageId,
      isActive: true
    };

    if (type === 'image') {
      where.imageUrl = { [Op.ne]: null };
    } else if (type === 'video') {
      where.videoUrl = { [Op.ne]: null };
    } else {
      where[Op.or] = [
        { imageUrl: { [Op.ne]: null } },
        { videoUrl: { [Op.ne]: null } }
      ];
    }

    const posts = await Post.findAndCountAll({
      where,
      attributes: ['id', 'imageUrl', 'videoUrl', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const media = posts.rows.map(post => ({
      postId: post.id,
      url: post.imageUrl || post.videoUrl,
      type: post.imageUrl ? 'image' : 'video',
      createdAt: post.createdAt
    }));

    res.status(200).json({
      success: true,
      data: media,
      pagination: {
        total: posts.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(posts.count / limit)
      }
    });
  } catch (error) {
    console.error('Get page media error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
