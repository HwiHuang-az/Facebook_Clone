const express = require('express');
const router = express.Router();
const savedPostController = require('../controllers/savedPostController');
const auth = require('../middleware/auth');

// Save a post
router.post('/', auth, savedPostController.savePost);

// Get all saved posts
router.get('/', auth, savedPostController.getSavedPosts);

// Get collections
router.get('/collections', auth, savedPostController.getCollections);

// Check if post is saved
router.get('/check/:postId', auth, savedPostController.checkSaved);

// Unsave a post
router.delete('/:id', auth, savedPostController.unsavePost);

module.exports = router;
