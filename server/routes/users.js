const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');
const { User, Post, Friendship } = require('../models');
const { Op } = require('sequelize');

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
router.get('/profile/:id', auth, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validateProfile, userController.updateProfile);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, userController.searchUsers);

// @route   GET /api/users/:id/friends
// @desc    Get user's friends list
// @access  Private
router.get('/:id/friends', auth, userController.getFriends);

// @route   POST /api/users/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('image'), userController.uploadProfilePicture);

// @route   POST /api/users/upload-cover-photo
// @desc    Upload cover photo
// @access  Private
router.post('/upload-cover-photo', auth, upload.single('image'), userController.uploadCoverPhoto);

// @route   GET /api/users/:id/photos
// @desc    Get user's photos
// @access  Private
router.get('/:id/photos', auth, userController.getUserPhotos);

module.exports = router; 