const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
// @access  Private
router.get('/post/:postId', auth, (req, res) => {
  res.json({ message: 'Get comments for post', postId: req.params.postId });
});

// @route   POST /api/comments
// @desc    Create new comment
// @access  Private
router.post('/', auth, (req, res) => {
  res.json({ message: 'Create new comment' });
});

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, (req, res) => {
  res.json({ message: 'Update comment', commentId: req.params.id });
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, (req, res) => {
  res.json({ message: 'Delete comment', commentId: req.params.id });
});

module.exports = router; 