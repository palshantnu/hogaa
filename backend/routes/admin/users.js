const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

// User routes
router.get('/', adminController.getUsers);
router.get('/view/:id', adminController.getUser);
router.post('/update-status/:id', adminController.updateUserStatus);

module.exports = router;