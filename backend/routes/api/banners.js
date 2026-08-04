const express = require('express');
const router = express.Router();
const Banner = require('../../models/Banner');
const { Op } = require('sequelize');

// Get active banners for frontend
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.findAll({
            where: {
                status: 'active'
            },
            order: [['sort_order', 'ASC']],
            attributes: ['id', 'title', 'description', 'media_type', 'image', 'video', 'video_poster', 'link']
        });
        
        // Format the response for frontend
        const formattedBanners = banners.map(banner => {
            const bannerData = banner.toJSON();
            
            // Add media URL based on type
            if (bannerData.media_type === 'image') {
                bannerData.media_url = bannerData.image ? `/uploads/banners/${bannerData.image}` : null;
                bannerData.thumbnail_url = bannerData.image ? `/uploads/banners/${bannerData.image}` : null;
            } else if (bannerData.media_type === 'video') {
                bannerData.media_url = bannerData.video ? `/uploads/banners/${bannerData.video}` : null;
                bannerData.thumbnail_url = bannerData.video_poster ? `/uploads/banners/${bannerData.video_poster}` : null;
            }
            
            return bannerData;
        });
        
        res.json(formattedBanners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single banner by ID
router.get('/:id', async (req, res) => {
    try {
        const banner = await Banner.findOne({
            where: {
                id: req.params.id,
                status: 'active'
            },
            attributes: ['id', 'title', 'description', 'media_type', 'image', 'video', 'video_poster', 'link']
        });
        
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found' });
        }
        
        const bannerData = banner.toJSON();
        
        // Add media URL based on type
        if (bannerData.media_type === 'image') {
            bannerData.media_url = bannerData.image ? `/uploads/banners/${bannerData.image}` : null;
            bannerData.thumbnail_url = bannerData.image ? `/uploads/banners/${bannerData.image}` : null;
        } else if (bannerData.media_type === 'video') {
            bannerData.media_url = bannerData.video ? `/uploads/banners/${bannerData.video}` : null;
            bannerData.thumbnail_url = bannerData.video_poster ? `/uploads/banners/${bannerData.video_poster}` : null;
        }
        
        res.json(bannerData);
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;