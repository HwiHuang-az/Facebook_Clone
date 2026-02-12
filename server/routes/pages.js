const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const auth = require('../middleware/auth');

router.post('/', auth, pageController.createPage);
router.get('/', auth, pageController.getPages);
router.get('/my', auth, pageController.getMyPages);
router.get('/:id', auth, pageController.getPageById);
router.put('/:id', auth, pageController.updatePage);
router.delete('/:id', auth, pageController.deletePage);

module.exports = router;
