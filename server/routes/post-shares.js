const express = require('express');
const router = express.Router();
const postShareController = require('../controllers/postShareController');
const auth = require('../middleware/auth');

// Share a post
router.post('/:postId/share', auth, postShareController.sharePost);

// Get shares of a post
router.get('/:postId/shares', auth, postShareController.getPostShares);

// Get user's shared posts
router.get('/user/shares', auth, postShareController.getUserShares);

// Delete a share
router.delete('/:id', auth, postShareController.deleteShare);

module.exports = router;
