const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

router.get('/', auth, searchController.unifiedSearch);
router.get('/recent', auth, searchController.getRecentSearches);
router.delete('/recent/:id', auth, searchController.deleteRecentSearch);
router.delete('/clear', auth, searchController.clearRecentSearches);

module.exports = router;
