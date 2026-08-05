const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../../controllers/adminController');

// Configure multer for multiple file fields
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'public/uploads/products';

        // Handle variation images/videos
        if (file.fieldname && (file.fieldname.startsWith('variation_images_') || file.fieldname.startsWith('variation_videos_'))) {
            dir = 'public/uploads/products/variations';
        }

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'product-';
        if (file.fieldname === 'product_video' || file.fieldname === 'product_videos') {
            prefix = 'product-video-';
        } else if (file.fieldname.startsWith('variation_videos_')) {
            prefix = 'variation-video-';
        } else if (file.fieldname.startsWith('variation_images_')) {
            prefix = 'variation-';
        }
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const imageTypes = /jpeg|jpg|png|gif|webp/;
        const videoTypes = /mp4|mov|avi|mkv|webm/;
        const fileExt = path.extname(file.originalname).toLowerCase();
        const isVideoField = file.fieldname === 'product_video' ||
            file.fieldname === 'product_videos' ||
            file.fieldname.startsWith('variation_videos_');
        const allowedTypes = isVideoField ? videoTypes : imageTypes;
        const extname = allowedTypes.test(fileExt);
        const mimetype = isVideoField ? file.mimetype.startsWith('video/') : allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error(isVideoField ? 'Only video files are allowed' : 'Only image files are allowed'));
        }
    }
});

// Helper to handle dynamic fields for variations
const uploadMiddleware = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).send('File upload error: ' + err.message);
        }
        next();
    });
};

// Product routes
router.get('/', adminController.getProducts);
router.get('/add', adminController.getAddProduct);
router.post('/add', uploadMiddleware, adminController.addProduct);
router.get('/edit/:id', adminController.getEditProduct);
router.post('/edit/:id', uploadMiddleware, adminController.updateProduct);
router.post('/delete/:id', adminController.deleteProduct);
router.post('/delete-image/:id/:image', adminController.deleteProductImage);
router.post('/delete-video/:id/:video', adminController.deleteProductVideo);
router.post('/toggle-status/:id', adminController.toggleProductStatus);

// Attribute routes
router.get('/attributes', adminController.getAttributes);
router.get('/attributes/add', adminController.getAddAttribute);
router.get('/attributes/edit/:id', adminController.getEditAttribute);
router.post('/attributes/add', upload.none(), adminController.addAttribute);
router.post('/attributes/edit/:id', upload.none(), adminController.updateAttribute);
router.get('/attributes/delete/:id', adminController.deleteAttribute);
router.post('/attributes/add-value', upload.none(), adminController.addAttributeValue);
router.get('/attributes/delete-value/:id', adminController.deleteAttributeValue);
router.post('/attributes/get-values', adminController.getAttributeValues);
router.delete('/delete-image/:id/:image', adminController.deleteProductImage);
router.delete('/delete-video/:id/:video', adminController.deleteProductVideo);
router.delete('/variation-image/:variationId/:imageName', adminController.deleteVariationImage);
router.put('/variation-image/:variationId/reorder', adminController.reorderVariationImages);
router.delete('/variation-video/:variationId/:videoName', adminController.deleteVariationVideo);
router.put('/variation-video/:variationId/reorder', adminController.reorderVariationVideos);


module.exports = router;
