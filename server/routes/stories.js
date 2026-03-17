const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/stories
// @desc    Tạo tin mới
// @access  Private
router.post('/', auth, upload.single('image'), storyController.createStory);

// @route   GET /api/stories
// @desc    Lấy tất cả tin (feed)
// @access  Private
router.get('/', auth, storyController.getStories);

// @route   GET /api/stories/user/:id
// @desc    Lấy tin của user cụ thể
// @access  Private
router.get('/user/:id', auth, storyController.getUserStories);

// @route   POST /api/stories/:id/view
// @desc    Đánh dấu tin đã xem
// @access  Private
router.post('/:id/view', auth, storyController.viewStory);

// @route   GET /api/stories/:id/viewers
// @desc    Lấy danh sách người đã xem tin
// @access  Private
router.get('/:id/viewers', auth, storyController.getStoryViewers);

module.exports = router;
