const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');

router.post('/', auth, marketplaceController.createItem);
router.get('/', auth, marketplaceController.getItems);
router.get('/:id', auth, marketplaceController.getItemById);
router.put('/:id', auth, marketplaceController.updateItem);
router.delete('/:id', auth, marketplaceController.deleteItem);

module.exports = router;
