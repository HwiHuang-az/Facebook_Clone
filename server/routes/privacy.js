const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const { authenticate } = require('../middleware/auth');

// Get privacy settings
router.get('/', authenticate, privacyController.getPrivacySettings);

// Update privacy settings
router.put('/', authenticate, privacyController.updatePrivacySettings);

// Reset to default
router.post('/reset', authenticate, privacyController.resetPrivacySettings);

module.exports = router;
