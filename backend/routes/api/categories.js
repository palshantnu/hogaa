const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.get('/', userController.getCategories);
router.get('/:id', userController.getCategoryById);
router.get('/slug/:slug', userController.getProductsByCategory);

module.exports = router;