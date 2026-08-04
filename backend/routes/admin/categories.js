const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../../controllers/adminController');

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/categories';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Category routes
router.get('/', adminController.getCategories);
router.get('/add', adminController.getAddCategory);
router.post('/add', upload.single('image'), adminController.addCategory);
router.get('/edit/:id', adminController.getEditCategory);
router.post('/edit/:id', upload.single('image'), adminController.updateCategory);
router.post('/delete/:id', adminController.deleteCategory);

module.exports = router;