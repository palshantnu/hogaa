const express = require('express');
const router = express.Router();
const HogaaInMotion = require('../../models/HogaaInMotion');

// Get active "Hogaa In Motion" GIFs for frontend
router.get('/', async (req, res) => {
    try {
        const items = await HogaaInMotion.findAll({
            where: { status: 'active' },
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
            attributes: ['id', 'title', 'image', 'link']
        });

        const formatted = items.map(item => {
            const data = item.toJSON();
            data.image_url = data.image ? `/uploads/hogaa-in-motion/${data.image}` : null;
            return data;
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching hogaa in motion items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
