const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/conversations', auth, messageController.getConversations);
router.get('/unread', auth, messageController.getUnreadCounts);
router.get('/:partnerId', auth, messageController.getMessages);
router.get('/media/:partnerId', auth, messageController.getConversationMedia);

// Allow up to 20 files per message
router.post('/', auth, upload.array('files', 20), messageController.sendMessage);

// Message management
router.delete('/:id', auth, messageController.deleteMessage);
router.delete('/:id/unsend', auth, messageController.unsendMessage);
router.delete('/conversation/:partnerId', auth, messageController.deleteConversation);

module.exports = router;
