// routes/admin/pages.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Page = require('../../models/Page');

// Image uploads triggered from the CKEditor content editor
const uploadDir = 'public/uploads/pages';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'page-' + uniqueSuffix + path.extname(file.originalname));
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

// CKEditor's CKFinderUploadAdapter posts the file as field "upload" and expects
// a { uploaded, url } response (uploaded: 0 + error.message on failure).
router.post('/upload-image', (req, res) => {
    upload.single('upload')(req, res, (err) => {
        if (err) {
            return res.json({ uploaded: 0, error: { message: err.message } });
        }
        if (!req.file) {
            return res.json({ uploaded: 0, error: { message: 'No image uploaded' } });
        }
        res.json({ uploaded: 1, url: `/uploads/pages/${req.file.filename}` });
    });
});

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