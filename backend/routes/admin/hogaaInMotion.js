const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../../controllers/adminController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/hogaa-in-motion';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'motion-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isGif = path.extname(file.originalname).toLowerCase() === '.gif' && file.mimetype === 'image/gif';
        if (isGif) {
            return cb(null, true);
        }
        cb(new Error('Only GIF files are allowed'));
    }
});

router.get('/', adminController.getHogaaInMotion);
router.get('/add', adminController.getAddHogaaInMotion);
router.post('/add', upload.array('images', 30), adminController.addHogaaInMotion);
router.get('/edit/:id', adminController.getEditHogaaInMotion);
router.post('/edit/:id', upload.single('image'), adminController.updateHogaaInMotion);
router.get('/delete/:id', adminController.deleteHogaaInMotion);
router.post('/toggle-status/:id', adminController.toggleHogaaInMotionStatus);

module.exports = router;
