const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { protect } = require('../middlewares/auth');

// Note: In real app, might not be protected if showing on public pages,
// but for Facebook clone, usually you're logged in.
router.get('/', protect, adController.getActiveAds);

module.exports = router;
