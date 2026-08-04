const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.get('/', userController.getCart);
router.post('/add', userController.addToCart);
router.put('/update/:item_id', userController.updateCartItem);
router.delete('/remove/:item_id', userController.removeFromCart);
router.delete('/clear', userController.clearCart);
router.get('/count', userController.getCartCount);
router.get('/summary', userController.getCartSummary);

router.post('/checkout', userController.createCheckoutOrder);
router.get('/orders', userController.getMyOrders);
router.get('/order/:id', userController.getOrderDetails);

module.exports = router;