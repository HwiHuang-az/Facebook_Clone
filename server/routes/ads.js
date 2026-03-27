const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { authenticateToken } = require('../middleware/auth');

// Public-facing: get active ads for logged-in user
router.get('/', authenticateToken, adController.getActiveAds);

// Admin-style: get all ads (with optional status filter)
router.get('/all', authenticateToken, adController.getAllAds);

// Create a new ad
router.post('/', authenticateToken, adController.createAd);

// Update an ad
router.put('/:id', authenticateToken, adController.updateAd);

// Delete an ad
router.delete('/:id', authenticateToken, adController.deleteAd);

module.exports = router;
