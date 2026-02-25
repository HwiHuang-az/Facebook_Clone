const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Submit a new report
router.post('/', auth, reportController.createReport);

// Get reports list (Admin only in real scenario)
router.get('/', auth, reportController.getReports);

module.exports = router;
