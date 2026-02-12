const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const auth = require('../middleware/auth');

// Get privacy settings
router.get('/', auth, privacyController.getPrivacySettings);

// Update privacy settings
router.put('/', auth, privacyController.updatePrivacySettings);

// Reset to default
router.post('/reset', auth, privacyController.resetPrivacySettings);

module.exports = router;
