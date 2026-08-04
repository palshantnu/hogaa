// routes/admin/pages.js
const express = require('express');
const router = express.Router();
const Page = require('../../models/Page');

// Get all pages
router.get('/', async (req, res) => {
    try {
        const pages = await Page.findAll({
            order: [['created_at', 'DESC']]
        });
        
        res.render('admin/pages/list', {
            title: 'Pages Management',
            admin: req.session.admin,
            pages: pages
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

// Add page form
router.get('/add', async (req, res) => {
    try {
        res.render('admin/pages/form', {
            title: 'Add New Page',
            admin: req.session.admin,
            page: null
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

// Create page
router.post('/add', async (req, res) => {
    try {
        const { slug, title, content, meta_title, meta_description, status } = req.body;
        
        // Generate slug if not provided
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        
        // Check if slug exists
        const existing = await Page.findOne({ where: { slug: finalSlug } });
        if (existing) {
            return res.status(400).send('Page with this slug already exists');
        }
        
        await Page.create({
            slug: finalSlug,
            title,
            content,
            meta_title: meta_title || title,
            meta_description: meta_description || content.substring(0, 160),
            status: status || 'active'
        });
        
        res.redirect('/admin/pages');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

// Edit page form
router.get('/edit/:id', async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);
        if (!page) {
            return res.redirect('/admin/pages');
        }
        
        res.render('admin/pages/form', {
            title: 'Edit Page',
            admin: req.session.admin,
            page: page
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

// Update page
router.post('/edit/:id', async (req, res) => {
    try {
        const { title, content, meta_title, meta_description, status } = req.body;
        
        const page = await Page.findByPk(req.params.id);
        if (!page) {
            return res.redirect('/admin/pages');
        }
        
        await page.update({
            title,
            content,
            meta_title: meta_title || title,
            meta_description: meta_description || content.substring(0, 160),
            status: status || 'active'
        });
        
        res.redirect('/admin/pages');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

// Delete page
router.get('/delete/:id', async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);
        if (page) {
            await page.destroy();
        }
        res.redirect('/admin/pages');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;