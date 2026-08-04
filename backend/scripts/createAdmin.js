// scripts/createAdmin.js
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const sequelize = require('../config/db');

async function createSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      where: { email: 'admin@gmail.com' } 
    });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      process.exit(0);
    }

    // Create super admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      mobile: '9999999999',
      password: '12345678',
      role: 'super_admin',
      status: 'active'
    });

    console.log('✅ Super Admin Created Successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: 12345678');
    console.log('👤 Role: Super Admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();