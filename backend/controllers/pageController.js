// controllers/pageController.js
const Page = require('../models/Page');

const pageController = {
    // Get single page by slug (for frontend)
    getPageBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            
            const page = await Page.findOne({
                where: { slug: slug, status: 'active' }
            });
            
            if (!page) {
                return res.status(404).json({
                    success: false,
                    message: 'Page not found'
                });
            }
            
            res.json({
                success: true,
                page: {
                    id: page.id,
                    title: page.title,
                    content: page.content,
                    meta_title: page.meta_title,
                    meta_description: page.meta_description,
                    slug: page.slug,
                    updated_at: page.updated_at
                }
            });
        } catch (error) {
            console.error('Get page error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
    
    // Get all active pages for footer (NEW API)
    getActivePages: async (req, res) => {
        try {
            const pages = await Page.findAll({
                where: { status: 'active' },
                attributes: ['id', 'title', 'slug', 'created_at'],
                order: [['created_at', 'ASC']]
            });
            
            res.json({
                success: true,
                pages: pages
            });
        } catch (error) {
            console.error('Get active pages error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
    
    // Get all pages (for admin)
    getAllPages: async (req, res) => {
        try {
            const pages = await Page.findAll({
                order: [['created_at', 'DESC']]
            });
            
            res.json({
                success: true,
                pages
            });
        } catch (error) {
            console.error('Get pages error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
    
    // Create new page (admin)
    createPage: async (req, res) => {
        try {
            const { slug, title, content, meta_title, meta_description, status } = req.body;
            
            // Generate slug if not provided
            let finalSlug = slug;
            if (!finalSlug) {
                finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            
            const existingPage = await Page.findOne({ where: { slug: finalSlug } });
            if (existingPage) {
                return res.status(400).json({
                    success: false,
                    message: 'Page with this slug already exists'
                });
            }
            
            const page = await Page.create({
                slug: finalSlug,
                title,
                content,
                meta_title: meta_title || title,
                meta_description: meta_description || content.substring(0, 160),
                status: status || 'active'
            });
            
            res.json({
                success: true,
                message: 'Page created successfully',
                page
            });
        } catch (error) {
            console.error('Create page error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
    
    // Update page (admin)
    updatePage: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, meta_title, meta_description, status } = req.body;
            
            const page = await Page.findByPk(id);
            if (!page) {
                return res.status(404).json({
                    success: false,
                    message: 'Page not found'
                });
            }
            
            await page.update({
                title,
                content,
                meta_title: meta_title || title,
                meta_description: meta_description || content.substring(0, 160),
                status
            });
            
            res.json({
                success: true,
                message: 'Page updated successfully',
                page
            });
        } catch (error) {
            console.error('Update page error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },
    
    // Delete page (admin)
    deletePage: async (req, res) => {
        try {
            const { id } = req.params;
            
            const page = await Page.findByPk(id);
            if (!page) {
                return res.status(404).json({
                    success: false,
                    message: 'Page not found'
                });
            }
            
            await page.destroy();
            
            res.json({
                success: true,
                message: 'Page deleted successfully'
            });
        } catch (error) {
            console.error('Delete page error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
};

module.exports = pageController;