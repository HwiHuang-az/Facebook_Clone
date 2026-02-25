const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/my', auth, groupController.getMyGroups);
router.get('/:id', auth, groupController.getGroupById);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);

router.get('/:id/members', groupController.getGroupMembers);
router.get('/:id/media', groupController.getGroupMedia);
router.post('/:id/cover-photo', auth, upload.single('image'), groupController.updateGroupCover);

module.exports = router;
