const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const friendshipController = require('../controllers/friendshipController');

// @route   POST /api/friendships/send-request
// @desc    Send friend request
// @access  Private
router.post('/send-request', auth, friendshipController.sendFriendRequest);

// @route   POST /api/friendships/accept-request
// @desc    Accept friend request
// @access  Private
router.post('/accept-request', auth, friendshipController.acceptFriendRequest);

// @route   POST /api/friendships/reject-request
// @desc    Reject friend request
// @access  Private
router.post('/reject-request', auth, friendshipController.rejectFriendRequest);

// @route   DELETE /api/friendships/unfriend
// @desc    Unfriend
// @access  Private
router.delete('/unfriend', auth, friendshipController.unfriend);

// @route   GET /api/friendships/requests
// @desc    Get friend requests
// @access  Private
router.get('/requests', auth, friendshipController.getFriendRequests);

// @route   GET /api/friendships/friends
// @desc    Get friends list
// @access  Private
router.get('/friends', auth, friendshipController.getFriends);

// @route   GET /api/friendships/suggestions
// @desc    Get friend suggestions
// @access  Private
router.get('/suggestions', auth, friendshipController.getFriendSuggestions);

// @route   GET /api/friendships/status/:targetUserId
// @desc    Get friendship status with target user
// @access  Private
router.get('/status/:targetUserId', auth, friendshipController.getFriendshipStatus);

module.exports = router; 