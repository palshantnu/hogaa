const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

// Order routes
router.get('/', adminController.getOrders);
router.get('/view/:id', adminController.getOrder);
router.get('/invoice/:id', adminController.getOrderInvoice);
router.post('/update-status/:id', adminController.updateOrderStatus);

router.post('/bulk-update', adminController.bulkUpdateOrders);
router.get('/export', adminController.exportOrders);
router.post('/update-status/:id', adminController.updateOrderStatus);

module.exports = router;