// createSuperAdmin.js (place in project root: /Users/apple/Desktop/node/hoga-Backend/)
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import from correct paths
const { Admin } = require('./models');
const sequelize = require('./config/db');

async function createSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = '12345678';

    // Check if admin exists
    let admin = await Admin.findOne({ where: { email: adminEmail } });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (admin) {
      await admin.update({ password: hashedPassword });
      console.log('✅ Admin password updated successfully!');
    } else {
      admin = await Admin.create({
        role: 'super_admin',
        name: 'Main Admin',
        email: adminEmail,
        mobile: '9999999999',
        password: hashedPassword,
        status: 'active'
      });
      console.log('✅ Super Admin created successfully!');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', admin.name);
    console.log('👔 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();