const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/my', auth, groupController.getMyGroups);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);

module.exports = router;
