const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  variation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_variations',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cgst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  sgst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  igst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  product_sku: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  variation_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderItem;