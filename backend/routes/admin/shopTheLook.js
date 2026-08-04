const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../../controllers/adminController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/shop-the-look';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'stl-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

router.get('/', adminController.getShopTheLook);
router.get('/add', adminController.getAddShopTheLook);
router.post('/add', upload.single('image'), adminController.addShopTheLook);
router.get('/edit/:id', adminController.getEditShopTheLook);
router.post('/edit/:id', upload.single('image'), adminController.updateShopTheLook);
router.get('/delete/:id', adminController.deleteShopTheLook);
router.post('/toggle-status/:id', adminController.toggleShopTheLookStatus);

module.exports = router;
