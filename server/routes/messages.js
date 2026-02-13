const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/conversations', auth, messageController.getConversations);
router.get('/unread', auth, messageController.getUnreadCounts);
router.get('/:partnerId', auth, messageController.getMessages);
router.get('/media/:partnerId', auth, messageController.getConversationMedia);

router.post('/', auth, upload.array('files', 10), messageController.sendMessage);

module.exports = router;
