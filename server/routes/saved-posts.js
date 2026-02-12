const express = require('express');
const router = express.Router();
const savedPostController = require('../controllers/savedPostController');
const { authenticate } = require('../middleware/auth');

// Save a post
router.post('/', authenticate, savedPostController.savePost);

// Get all saved posts
router.get('/', authenticate, savedPostController.getSavedPosts);

// Get collections
router.get('/collections', authenticate, savedPostController.getCollections);

// Check if post is saved
router.get('/check/:postId', authenticate, savedPostController.checkSaved);

// Unsave a post
router.delete('/:id', authenticate, savedPostController.unsavePost);

module.exports = router;
