const express = require('express');
const router = express.Router();
const SiteSetting = require('../../models/SiteSetting');

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

module.exports = router;
