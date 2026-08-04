const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../../controllers/adminController');

// Configure multer for multiple file types
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/banners';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'banner-';
        if (file.fieldname === 'video') prefix = 'video-';
        if (file.fieldname === 'video_poster') prefix = 'poster-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for images'));
            }
        } else if (file.fieldname === 'video') {
            const allowedTypes = /mp4|webm|ogg|mov/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only video files are allowed for videos'));
            }
        } else if (file.fieldname === 'video_poster') {
            const allowedTypes = /jpeg|jpg|png/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for video posters'));
            }
        } else {
            cb(null, true);
        }
    }
});

// Use upload.fields for multiple file types
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'video_poster', maxCount: 1 }
]);

// Routes
router.get('/', adminController.getBanners);
router.get('/add', adminController.getAddBanner);
router.post('/add', uploadFields, adminController.addBanner);
router.get('/edit/:id', adminController.getEditBanner);
router.post('/edit/:id', uploadFields, adminController.updateBanner);
router.get('/delete/:id', adminController.deleteBanner);
router.post('/toggle-status/:id', adminController.toggleBannerStatus);

module.exports = router;