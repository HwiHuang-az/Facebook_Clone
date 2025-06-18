const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
router.get('/profile/:id', auth, (req, res) => {
  res.json({ message: 'Get user profile', userId: req.params.id });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, (req, res) => {
  res.json({ message: 'Update user profile' });
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, (req, res) => {
  res.json({ message: 'Search users', query: req.query.q });
});

module.exports = router; 