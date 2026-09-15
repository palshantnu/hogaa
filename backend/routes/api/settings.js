const express = require('express');
const router = express.Router();
const SiteSetting = require('../../models/SiteSetting');
const { DEFAULT_APP_PROMO } = require('../../utils/appPromoDefaults');
const { getShippingSettings } = require('../../utils/shipping');

// GET marquee messages (public)
router.get('/marquee', async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ where: { key: 'marquee_messages' } });
        if (setting && setting.value) {
            const messages = JSON.parse(setting.value);
            return res.json({ success: true, messages });
        }
        // Default messages if not set
        res.json({
            success: true,
            messages: [
                "Enjoy up to 10% off on orders above ₹1199",
                "Free shipping on orders above ₹499",
                "Flat 20% OFF | Use Code: hogaa20"
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, messages: [] });
    }
});

// GET homepage promo section ("Shop smarter with hogaa") - public
router.get('/app-promo', async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ where: { key: 'app_promo' } });
        if (setting && setting.value) {
            return res.json({ success: true, promo: { ...DEFAULT_APP_PROMO, ...JSON.parse(setting.value) } });
        }
        res.json({ success: true, promo: DEFAULT_APP_PROMO });
    } catch (error) {
        res.status(500).json({ success: false, promo: DEFAULT_APP_PROMO });
    }
});

// GET shipping charge config (same-state vs other-state) - public
router.get('/shipping-charge', async (req, res) => {
    try {
        const shipping = await getShippingSettings();
        res.json({ success: true, shipping });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
