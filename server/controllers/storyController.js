const { Story, User, StoryView } = require('../models');
const { Op } = require('sequelize');

// Tạo story mới
const createStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, backgroundColor } = req.body;
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = req.file.path;
      } else {
        imageUrl = req.file.path;
      }
    }

    // Story hết hạn sau 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      userId,
      content,
      imageUrl,
      videoUrl,
      backgroundColor,
      expiresAt,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo tin'
    });
  }
};

// Lấy danh sách stories (cho newsfeed)
const getStories = async (req, res) => {
  try {
    const now = new Date();
    
    // Facebook style: Gom nhóm stories theo user
    const stories = await Story.findAll({
      where: {
        expiresAt: { [Op.gt]: now }
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: StoryView,
          as: 'views',
          attributes: ['userId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tin'
    });
  }
};

// Lấy stories của một user (cho profile)
const getUserStories = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const stories = await Story.findAll({
      where: {
        userId: id,
        expiresAt: { [Op.gt]: now }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tin của người dùng'
    });
  }
};

// Xem story (tăng view)
const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [view, created] = await StoryView.findOrCreate({
      where: { storyId: id, userId },
      defaults: { viewedAt: new Date() }
    });

    if (created) {
      await Story.increment('viewsCount', { where: { id } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ success: false });
  }
};

// Lấy danh sách người đã xem tin
const getStoryViewers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin'
      });
    }

    // Chỉ chủ sở hữu tin mới xem được danh sách người đã xem
    if (story.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem danh sách người xem của tin này'
      });
    }

    const viewers = await StoryView.findAll({
      where: { storyId: id },
      include: [
        {
          model: User,
          as: 'viewer',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['viewedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: viewers
    });
  } catch (error) {
    console.error('Get story viewers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách người xem'
    });
  }
};

module.exports = {
  createStory,
  getStories,
  getUserStories,
  viewStory,
  getStoryViewers
};
