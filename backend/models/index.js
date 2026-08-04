const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import all models
const Admin = require('./Admin');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Attribute = require('./Attribute');
const AttributeValue = require('./AttributeValue');
const ProductVariation = require('./ProductVariation');
const Page = require('./Page');

// ========== User Associations ==========
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// ========== Cart Associations ==========
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });

// ========== CartItem Associations ==========
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
CartItem.belongsTo(ProductVariation, { foreignKey: 'variation_id', as: 'variation' });

// ========== Product Associations ==========
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(ProductVariation, { foreignKey: 'product_id', as: 'variations' });

// ========== Product Variation Associations ==========
ProductVariation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductVariation.hasMany(OrderItem, { foreignKey: 'variation_id', as: 'order_items' });
ProductVariation.hasMany(CartItem, { foreignKey: 'variation_id', as: 'cart_items' });

// ========== Category Associations ==========
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// ========== Order Associations ==========
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });

// ========== OrderItem Associations ==========
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(ProductVariation, { foreignKey: 'variation_id', as: 'variation' });

// ========== Attribute Associations ==========
Attribute.hasMany(AttributeValue, { foreignKey: 'attribute_id', as: 'values' });
AttributeValue.belongsTo(Attribute, { foreignKey: 'attribute_id', as: 'attribute' });

// ========== Product Variation Attributes (Junction Table) ==========
const ProductVariationAttribute = sequelize.define('ProductVariationAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attribute_value_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'product_variation_attributes',
    timestamps: false
});

// ========== ProductVariationAttribute Associations ==========
ProductVariationAttribute.belongsTo(ProductVariation, { foreignKey: 'variation_id', as: 'variation' });
ProductVariationAttribute.belongsTo(Attribute, { foreignKey: 'attribute_id', as: 'attribute' });
ProductVariationAttribute.belongsTo(AttributeValue, { foreignKey: 'attribute_value_id', as: 'attribute_value' });

ProductVariation.hasMany(ProductVariationAttribute, { foreignKey: 'variation_id', as: 'variation_attributes' });
Attribute.hasMany(ProductVariationAttribute, { foreignKey: 'attribute_id', as: 'attribute_links' });
AttributeValue.hasMany(ProductVariationAttribute, { foreignKey: 'attribute_value_id', as: 'variation_links' });

// Many-to-many relationships
ProductVariation.belongsToMany(AttributeValue, { 
    through: ProductVariationAttribute, 
    foreignKey: 'variation_id',
    otherKey: 'attribute_value_id',
    as: 'attribute_values'
});

AttributeValue.belongsToMany(ProductVariation, { 
    through: ProductVariationAttribute, 
    foreignKey: 'attribute_value_id',
    otherKey: 'variation_id',
    as: 'product_variations'
});

ProductVariation.belongsToMany(Attribute, {
    through: ProductVariationAttribute,
    foreignKey: 'variation_id',
    otherKey: 'attribute_id',
    as: 'product_attributes'
});

Attribute.belongsToMany(ProductVariation, {
    through: ProductVariationAttribute,
    foreignKey: 'attribute_id',
    otherKey: 'variation_id',
    as: 'variations'
});

console.log('✅ All model associations established');

module.exports = {
    sequelize,
    Admin,
    User,
    Category,
    Product,
    ProductVariation,
    ProductVariationAttribute,
    Attribute,
    AttributeValue,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Page
};