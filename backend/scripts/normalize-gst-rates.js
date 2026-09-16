// scripts/normalize-gst-rates.js
// Existing products/variations (created before the single "GST Rate" field) may have
// only cgst_rate+sgst_rate set, or only igst_rate set, or neither. This backfills every
// row so cgst_rate = sgst_rate = total/2 and igst_rate = total for BOTH simple products
// and variations, matching what addProduct/updateProduct now save going forward, and
// recalculates base_price from that total.
//
//   node scripts/normalize-gst-rates.js
//
// Safe to run more than once.
const sequelize = require('../config/db');
const Product = require('../models/Product');
const ProductVariation = require('../models/ProductVariation');
const { splitGstRate } = require('../utils/gst');

function normalizedGst(row) {
    const cgst = parseFloat(row.cgst_rate) || 0;
    const sgst = parseFloat(row.sgst_rate) || 0;
    const igst = parseFloat(row.igst_rate) || 0;
    // Whichever was actually filled in before is treated as the intended total.
    const total = (cgst + sgst) > 0 ? (cgst + sgst) : igst;
    return splitGstRate(total);
}

function basePriceFor(price, totalGstRate) {
    const finalPrice = parseFloat(price) || 0;
    if (totalGstRate > 0) {
        return (finalPrice * 100) / (100 + totalGstRate);
    }
    return finalPrice;
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const products = await Product.findAll();
        let updatedProducts = 0;
        for (const product of products) {
            const { cgst_rate, sgst_rate, igst_rate } = normalizedGst(product);
            const base_price = basePriceFor(product.price, cgst_rate + sgst_rate);
            await product.update({ cgst_rate, sgst_rate, igst_rate, base_price });
            updatedProducts++;
        }
        console.log(`✅ Normalized GST rates for ${updatedProducts} product(s)`);

        const variations = await ProductVariation.findAll();
        let updatedVariations = 0;
        for (const variation of variations) {
            const { cgst_rate, sgst_rate, igst_rate } = normalizedGst(variation);
            const base_price = basePriceFor(variation.price, cgst_rate + sgst_rate);
            await variation.update({ cgst_rate, sgst_rate, igst_rate, base_price });
            updatedVariations++;
        }
        console.log(`✅ Normalized GST rates for ${updatedVariations} variation(s)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Normalize GST rates failed:', error);
        process.exit(1);
    }
}

run();
