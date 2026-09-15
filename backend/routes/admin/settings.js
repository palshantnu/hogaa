const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SiteSetting = require('../../models/SiteSetting');
const { DEFAULT_APP_PROMO } = require('../../utils/appPromoDefaults');
const { getShippingSettings, SHIPPING_SETTING_KEY } = require('../../utils/shipping');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.admin) return next();
    res.redirect('/admin/auth/login');
};

const uploadDir = 'public/uploads/promo';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'promo-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});
const uploadPromoImages = upload.fields([
    { name: 'image_tall', maxCount: 1 },
    { name: 'image_stack1', maxCount: 1 },
    { name: 'image_stack2', maxCount: 1 }
]);

// GET settings page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ where: { key: 'marquee_messages' } });
        let messages = [
            "Enjoy up to 10% off on orders above ₹1199",
            "Free shipping on orders above ₹499",
            "Flat 20% OFF | Use Code: hogaa20"
        ];
        if (setting && setting.value) {
            messages = JSON.parse(setting.value);
        }

        const promoSetting = await SiteSetting.findOne({ where: { key: 'app_promo' } });
        let promo = DEFAULT_APP_PROMO;
        if (promoSetting && promoSetting.value) {
            promo = { ...DEFAULT_APP_PROMO, ...JSON.parse(promoSetting.value) };
        }

        const shipping = await getShippingSettings();

        res.render('admin/settings', {
            title: 'Site Settings',
            admin: req.session.admin,
            messages,
            promo,
            shipping,
            success: req.query.success
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).send('Error loading settings');
    }
});

// POST save marquee messages
router.post('/marquee', isAuthenticated, async (req, res) => {
    try {
        let messages = req.body['messages[]'] || req.body.messages || [];
        if (typeof messages === 'string') messages = [messages];
        messages = messages.map(m => m.trim()).filter(m => m.length > 0);

        await SiteSetting.upsert({ key: 'marquee_messages', value: JSON.stringify(messages) });
        res.redirect('/admin/settings?success=1');
    } catch (error) {
        console.error('Save settings error:', error);
        res.status(500).send('Error saving settings');
    }
});

// POST save shipping charges (same-state vs other-state)
router.post('/shipping', isAuthenticated, async (req, res) => {
    try {
        const { homeState, sameStateCharge, otherStateCharge } = req.body;

        const shipping = {
            homeState: (homeState || '').trim(),
            sameStateCharge: parseFloat(sameStateCharge) || 0,
            otherStateCharge: parseFloat(otherStateCharge) || 0
        };

        await SiteSetting.upsert({ key: SHIPPING_SETTING_KEY, value: JSON.stringify(shipping) });
        res.redirect('/admin/settings?success=1');
    } catch (error) {
        console.error('Save shipping settings error:', error);
        res.status(500).send('Error saving shipping settings');
    }
});

// POST save the "Shop smarter with hogaa" homepage promo section
router.post('/app-promo', isAuthenticated, uploadPromoImages, async (req, res) => {
    try {
        const existing = await SiteSetting.findOne({ where: { key: 'app_promo' } });
        const current = existing && existing.value
            ? { ...DEFAULT_APP_PROMO, ...JSON.parse(existing.value) }
            : DEFAULT_APP_PROMO;

        const {
            badge, title, titleHighlight, description,
            feature1_icon, feature1_label,
            feature2_icon, feature2_label,
            feature3_icon, feature3_label,
            cta_primary_text, cta_primary_link,
            cta_secondary_text, cta_secondary_link,
            existing_image_tall, existing_image_stack1, existing_image_stack2
        } = req.body;

        const files = req.files || {};
        const imageTall = files.image_tall ? `/uploads/promo/${files.image_tall[0].filename}` : (existing_image_tall || current.images.tall);
        const imageStack1 = files.image_stack1 ? `/uploads/promo/${files.image_stack1[0].filename}` : (existing_image_stack1 || current.images.stack1);
        const imageStack2 = files.image_stack2 ? `/uploads/promo/${files.image_stack2[0].filename}` : (existing_image_stack2 || current.images.stack2);

        const promo = {
            badge,
            title,
            titleHighlight,
            description,
            features: [
                { icon: feature1_icon, label: feature1_label },
                { icon: feature2_icon, label: feature2_label },
                { icon: feature3_icon, label: feature3_label }
            ],
            ctaPrimary: { text: cta_primary_text, link: cta_primary_link },
            ctaSecondary: { text: cta_secondary_text, link: cta_secondary_link },
            images: { tall: imageTall, stack1: imageStack1, stack2: imageStack2 }
        };

        await SiteSetting.upsert({ key: 'app_promo', value: JSON.stringify(promo) });
        res.redirect('/admin/settings?success=1');
    } catch (error) {
        console.error('Save app promo error:', error);
        res.status(500).send('Error saving promo section');
    }
});

module.exports = router;
