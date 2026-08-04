const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// Product routes - order matters (specific first, then dynamic)
router.get('/', userController.getProducts);
router.get('/search/quick', userController.quickSearch);
router.post('/get-variation', userController.getVariationByAttributes);
router.get('/variations/:product_id', userController.getProductVariations);
// This should be last - it catches all remaining routes
router.get('/:slug', userController.getProductById);
router.get('/category/:categorySlug', userController.getProductsByCategory);
module.exports = router;