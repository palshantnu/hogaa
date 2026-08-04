const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

// Dashboard route
router.get('/', adminController.getDashboard);

module.exports = router;