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

module.exports = router;
