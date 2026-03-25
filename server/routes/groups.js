const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/my', auth, groupController.getMyGroups);
router.get('/suggestions', auth, groupController.getGroupSuggestions);
router.get('/:id', auth, groupController.getGroupById);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);

router.get('/:id/members', groupController.getGroupMembers);
router.get('/:id/pending-members', auth, groupController.getPendingMembers);
router.post('/:id/approve/:userId', auth, groupController.approveMember);
router.post('/:id/reject/:userId', auth, groupController.rejectMember);
router.post('/:id/change-role/:userId', auth, groupController.changeMemberRole);
router.get('/:id/media', groupController.getGroupMedia);
router.post('/:id/cover-photo', auth, upload.single('image'), groupController.updateGroupCover);

module.exports = router;
