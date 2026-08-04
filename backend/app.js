require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();
app.use(expressLayouts);
app.set('layout', 'layout');

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin/views'));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecommerce_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://hogaacosmetics.com',
    'https://www.hogaacosmetics.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Make session user available to all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  next();
});

// ========== API ROUTES ==========
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/payment', require('./routes/api/payment'));
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api/products', require('./routes/api/products'));
app.use('/api/cart', require('./routes/api/cart'));
app.use('/api/pages', require('./routes/api/pages'));
app.use('/api/orders', require('./routes/api/orders'));
app.use('/api/banners', require('./routes/api/banners'));
app.use('/api/settings', require('./routes/api/settings'));


// ========== ADMIN ROUTES ==========
app.use('/admin/auth', require('./routes/admin/auth'));
app.use('/admin/dashboard', require('./routes/admin/dashboard')); 
app.use('/admin/categories', require('./routes/admin/categories'));
app.use('/admin/products', require('./routes/admin/products'));
app.use('/admin/orders', require('./routes/admin/orders'));
app.use('/admin/pages', require('./routes/admin/pages'));
app.use('/admin/banners', require('./routes/admin/banners'));
app.use('/admin/users', require('./routes/admin/users'));
app.use('/admin/settings', require('./routes/admin/settings'));

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API is running', 
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;