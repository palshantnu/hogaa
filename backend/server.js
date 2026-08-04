require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');

// Import all models from index (this handles associations)
const { Admin, User, Category, Product, Cart, CartItem, Order, OrderItem } = require('./models');

const PORT = process.env.PORT || 5050;

(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');

    // Sync all models with database
    await sequelize.sync({ alter: false });
    console.log('✅ All models synchronized');

    // Check if super admin exists, if not create one
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      console.log('⚠️ No admin found. Please run: node scripts/createAdmin.js');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 API URL: http://localhost:${PORT}/api`);
      console.log(`🔧 Admin URL: http://localhost:${PORT}/admin/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();