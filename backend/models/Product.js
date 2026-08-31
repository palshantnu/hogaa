const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: true,
    unique: true
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  compare_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Original price before discount'
  },
  cost_per_item: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_status: {
    type: DataTypes.ENUM('in_stock', 'out_of_stock', 'backorder'),
    defaultValue: 'in_stock'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of image filenames'
  },
  product_video: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Deprecated: use product_videos instead'
  },
  product_videos: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of product video filenames'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Weight in grams'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{length, width, height}'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tags'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Manual display order; lower number is shown first'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sold_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  meta_title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // New fields for attributes and variations
  has_variations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cgst_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'cgst_rate'  // Explicitly map to database column
  },
  sgst_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'sgst_rate'
  },
  igst_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'igst_rate'
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
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Hooks
Product.beforeCreate(async (product) => {
  if (product.name && !product.slug) {
    product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
});

// Instance methods
Product.prototype.getDiscountedPrice = function() {
  if (this.compare_price && this.compare_price > this.price) {
    const discount = ((this.compare_price - this.price) / this.compare_price) * 100;
    return {
      price: parseFloat(this.price),
      original_price: parseFloat(this.compare_price),
      discount_percentage: Math.round(discount)
    };
  }
  return {
    price: parseFloat(this.price),
    original_price: null,
    discount_percentage: 0
  };
};

Product.prototype.isInStock = function() {
  if (this.has_variations) {
    return true; // Will be checked at variation level
  }
  return this.stock > 0 && this.stock_status === 'in_stock';
};

Product.prototype.getGSTAmount = function(amount) {
  const cgst = (amount * (parseFloat(this.cgst_rate) || 0)) / 100;
  const sgst = (amount * (parseFloat(this.sgst_rate) || 0)) / 100;
  const igst = (amount * (parseFloat(this.igst_rate) || 0)) / 100;
  return { cgst, sgst, igst, total: cgst + sgst + igst };
};

module.exports = Product;
