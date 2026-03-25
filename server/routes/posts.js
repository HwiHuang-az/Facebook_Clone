const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');
const postShareController = require('../controllers/postShareController');
const upload = require('../middleware/upload');

// @route   GET /api/posts
// @desc    Get all posts (newsfeed)
// @access  Private
router.get('/', auth, postController.getAllPosts);

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, upload.single('image'), postController.createPost);

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', auth, postController.getPost);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', auth, postController.updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', auth, postController.toggleLikePost);

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Private
router.get('/user/:userId', auth, postController.getUserPosts);

// Share routes
router.post('/:postId/share', auth, postShareController.sharePost);
router.get('/:postId/shares', auth, postShareController.getPostShares);
router.get('/shares/me', auth, postShareController.getUserShares);
router.delete('/shares/:id', auth, postShareController.deleteShare);

module.exports = router;
 