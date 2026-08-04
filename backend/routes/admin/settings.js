const express = require('express');
const router = express.Router();
const SiteSetting = require('../../models/SiteSetting');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.admin) return next();
    res.redirect('/admin/auth/login');
};

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
        res.render('admin/settings', {
            title: 'Site Settings',
            admin: req.session.admin,
            messages,
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

module.exports = router;
