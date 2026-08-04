// routes/api/pages.js
const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/pageController');

// Public routes
router.get('/active', pageController.getActivePages);  // Get all active pages for footer
router.get('/:slug', pageController.getPageBySlug);     // Get single page by slug

// Admin routes (protected)
router.get('/', pageController.getAllPages);
router.post('/', pageController.createPage);
router.put('/:id', pageController.updatePage);
router.delete('/:id', pageController.deletePage);

module.exports = router;