// scripts/add-product-sequence-column.js
// Adds the `sequence` column to the products table and backfills it using the
// current default ordering (newest product first), so the visible order does
// not change when listings switch to `sequence ASC`.
//
//   node scripts/add-product-sequence-column.js
//
// Safe to run more than once - it skips the parts that are already applied.
const sequelize = require('../config/db');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('products');

    if (table.sequence) {
      console.log('ℹ️  Column `sequence` already exists - skipping ALTER.');
    } else {
      await sequelize.query(
        "ALTER TABLE products ADD COLUMN sequence INT NOT NULL DEFAULT 0 " +
        "COMMENT 'Manual display order; lower number is shown first' AFTER is_active"
      );
      console.log('✅ Added column `sequence`');

      await sequelize.query(
        "UPDATE products p " +
        "JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) AS rn FROM products) seq " +
        "ON seq.id = p.id SET p.sequence = seq.rn"
      );
      console.log('✅ Backfilled `sequence` for existing products (newest = 1)');

      try {
        await sequelize.query('ALTER TABLE products ADD INDEX idx_products_sequence (sequence)');
        console.log('✅ Added index idx_products_sequence');
      } catch (e) {
        console.log('ℹ️  Index idx_products_sequence not added:', e.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

run();
