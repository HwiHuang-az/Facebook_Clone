const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ message: 'Get all posts' });
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, (req, res) => {
  res.json({ message: 'Create new post' });
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', auth, (req, res) => {
  res.json({ message: 'Get single post', postId: req.params.id });
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', auth, (req, res) => {
  res.json({ message: 'Update post', postId: req.params.id });
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, (req, res) => {
  res.json({ message: 'Delete post', postId: req.params.id });
});

module.exports = router; 