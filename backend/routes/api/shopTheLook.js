const express = require('express');
const router = express.Router();
const ShopTheLook = require('../../models/ShopTheLook');

// Get active "Shop The Look" images for frontend
router.get('/', async (req, res) => {
    try {
        const items = await ShopTheLook.findAll({
            where: { status: 'active' },
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
            attributes: ['id', 'label', 'image', 'link']
        });

        const formatted = items.map(item => {
            const data = item.toJSON();
            data.image_url = data.image ? `/uploads/shop-the-look/${data.image}` : null;
            return data;
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching shop the look items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
