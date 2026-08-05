const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const ProductVariation = sequelize.define('ProductVariation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(100),
        unique: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    compare_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    cost_per_item: {
        type: DataTypes.DECIMAL(10, 2)
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stock_status: {
        type: DataTypes.ENUM('in_stock', 'out_of_stock', 'backorder'),
        defaultValue: 'in_stock'
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    videos: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2)
    },
    cgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    sgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    igst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    variation_slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true
    },
    base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Price without GST'
    },
    is_online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    online_retailers: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of {title, url, image} objects'
    },
}, {
    tableName: 'product_variations',
    timestamps: true,
    underscored: true
});

Product.hasMany(ProductVariation, { foreignKey: 'product_id' });
ProductVariation.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = ProductVariation;