const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { authenticateToken } = require('../middleware/auth');

// Note: In real app, might not be protected if showing on public pages,
// but for Facebook clone, usually you're logged in.
router.get('/', authenticateToken, adController.getActiveAds);

module.exports = router;
