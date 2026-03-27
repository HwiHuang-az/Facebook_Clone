const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getNotifications);
router.put('/mark-all-read', auth, (req, res, next) => {
  req.params.id = 'all';
  notificationController.markAsRead(req, res, next);
});
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
