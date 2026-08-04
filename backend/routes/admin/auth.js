const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');

// ================= LOGIN PAGE (GET) - Render HTML =================
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    
    // Render the login.ejs template
    res.render('login', { 
        title: 'Admin Login', 
        layout: false,  // No layout for login page
        error: null 
    });
});

// ================= LOGIN (POST) - Handle form submission =================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.render('login', { 
                layout: false, 
                title: 'Admin Login',
                error: 'Invalid email or password' 
            });
        }

        const isValid = await admin.validatePassword(password);
        if (!isValid) {
            return res.render('login', { 
                layout: false, 
                title: 'Admin Login',
                error: 'Invalid email or password' 
            });
        }

        if (admin.status !== 'active') {
            return res.render('login', { 
                layout: false, 
                title: 'Admin Login',
                error: 'Your account is inactive' 
            });
        }

        // Save session
        req.session.admin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        };

        await admin.update({ last_login: new Date() });

        // Redirect to dashboard on success
        return res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Admin login error:', error);
        return res.render('login', { 
            layout: false, 
            title: 'Admin Login',
            error: 'Server error. Please try again.' 
        });
    }
});

// ================= LOGOUT =================
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/auth/login');
    });
});

// ================= DASHBOARD (Protected) =================
router.get('/dashboard', async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/auth/login');
    }
    
    try {
        const Order = require('../../models/Order');
        const Product = require('../../models/Product');
        const User = require('../../models/User');
        const { Op } = require('sequelize');
        
        const totalOrders = await Order.count();
        const totalProducts = await Product.count();
        const totalUsers = await User.count();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = await Order.sum('total', {
            where: { 
                created_at: { [Op.gte]: today },
                order_status: { [Op.ne]: 'cancelled' }
            }
        });
        
        const recentOrders = await Order.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        });
        
        res.render('dashboard', {
            title: 'Dashboard',
            admin: req.session.admin,
            stats: { totalOrders, totalProducts, totalUsers, todaySales: todaySales || 0 },
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.send('Error loading dashboard');
    }
});

module.exports = router;