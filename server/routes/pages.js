const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), pageController.createPage);
router.get('/', auth, pageController.getPages);
router.get('/my', auth, pageController.getMyPages);
router.get('/liked', auth, pageController.getLikedPages);
router.get('/:id', auth, pageController.getPageById);
router.post('/:id/like', auth, pageController.toggleLikePage);
router.put('/:id', auth, pageController.updatePage);
router.get('/:id/members', pageController.getPageMembers);
router.get('/:id/media', pageController.getPageMedia);
router.post('/:id/cover-photo', auth, upload.single('image'), pageController.updatePageCover);
router.post('/:id/profile-picture', auth, upload.single('image'), pageController.updatePageProfile);

module.exports = router;
