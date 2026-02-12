const express = require('express');
const router = express.Router();
const blockedUserController = require('../controllers/blockedUserController');
const { authenticate } = require('../middleware/auth');

// Block a user
router.post('/', authenticate, blockedUserController.blockUser);

// Get blocked users list
router.get('/', authenticate, blockedUserController.getBlockedUsers);

// Check if user is blocked
router.get('/check/:userId', authenticate, blockedUserController.checkBlocked);

// Unblock a user
router.delete('/:id', authenticate, blockedUserController.unblockUser);

module.exports = router;
