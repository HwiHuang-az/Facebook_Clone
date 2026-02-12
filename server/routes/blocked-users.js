const express = require('express');
const router = express.Router();
const blockedUserController = require('../controllers/blockedUserController');
const auth = require('../middleware/auth');

// Block a user
router.post('/', auth, blockedUserController.blockUser);

// Get blocked users list
router.get('/', auth, blockedUserController.getBlockedUsers);

// Check if user is blocked
router.get('/check/:userId', auth, blockedUserController.checkBlocked);

// Unblock a user
router.delete('/:id', auth, blockedUserController.unblockUser);

module.exports = router;
