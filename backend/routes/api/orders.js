// routes/api/orders.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// Make sure all these functions exist in userController
router.post('/create', userController.createCheckoutOrder);
router.get('/my-orders', userController.getMyOrders);
router.get('/:id', userController.getOrderDetails);

module.exports = router;