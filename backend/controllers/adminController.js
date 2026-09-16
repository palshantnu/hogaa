const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');
const ShopTheLook = require('../models/ShopTheLook');
const HogaaInMotion = require('../models/HogaaInMotion');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const OrderItem = require('../models/OrderItem');
const { Op } = require('sequelize');
const Attribute = require('../models/Attribute');
const AttributeValue = require('../models/AttributeValue');
const ProductVariation = require('../models/ProductVariation');
const { ProductVariationAttribute } = require('../models');
const fs = require('fs');
const path = require('path');
const { splitGstRate } = require('../utils/gst');


const sequelize = require('../config/db');

// Compress uploaded image with sharp
async function compressImage(filePath) {
    let sharp;
    try {
        sharp = require('sharp');
    } catch {
        console.warn('sharp not installed, skipping image compression');
        return filePath;
    }
    try {
        const ext = path.extname(filePath).toLowerCase();
        const dir = path.dirname(filePath);
        const base = path.basename(filePath, ext);
        const tmp = path.join(dir, `${base}_tmp.webp`);
        const finalPath = path.join(dir, `${base}.webp`);

        await sharp(filePath)
            .resize({ width: 1280, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(tmp);

        fs.unlinkSync(filePath);
        fs.renameSync(tmp, finalPath);
        console.log('Image compressed:', path.basename(finalPath));
        return finalPath;
    } catch (e) {
        console.error('Image compression failed:', e.message);
        return filePath;
    }
}

// Compress uploaded video with FFmpeg
function compressVideo(filePath) {
    return new Promise((resolve) => {
        let ffmpeg;
        try {
            ffmpeg = require('fluent-ffmpeg');
        } catch {
            console.warn('fluent-ffmpeg not installed, skipping compression');
            return resolve(filePath);
        }

        const dir  = path.dirname(filePath);
        const ext  = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const tmp  = path.join(dir, `${base}_tmp${ext}`);

        ffmpeg(filePath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioBitrate('128k')
            .addOption('-crf', '28')
            .addOption('-preset', 'fast')
            .addOption('-movflags', '+faststart')
            .addOption('-vf', "scale='min(1280,iw)':-2")
            .on('end', () => {
                try {
                    fs.unlinkSync(filePath);
                    fs.renameSync(tmp, filePath);
                } catch (e) {
                    console.error('Video replace error:', e.message);
                }
                console.log('Video compressed:', path.basename(filePath));
                resolve(filePath);
            })
            .on('error', (err) => {
                console.error('Video compression failed:', err.message);
                if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                resolve(filePath); // keep original on failure
            })
            .save(tmp);
    });
}

// Compress a batch of newly uploaded videos in the background (non-blocking).
// Animated GIFs uploaded into the same "video" fields are left untouched -
// re-encoding them with a video codec would break the format.
function compressVideos(filenames, dir) {
    (filenames || []).forEach(filename => {
        if (path.extname(filename).toLowerCase() === '.gif') return;
        const videoPath = path.join(__dirname, dir, filename);
        compressVideo(videoPath).catch(err => console.error('Compression error:', err));
    });
}

// Build retailers array from body + uploaded files
function buildRetailers(retailersBody, files, filePrefix) {
    const retailers = [];
    if (!retailersBody) return retailers;
    for (const idx in retailersBody) {
        const r = retailersBody[idx];
        const imgFile = files ? files.find(f => f.fieldname === `${filePrefix}${idx}`) : null;
        retailers.push({
            title: r.title || '',
            url: r.url || '',
            image: imgFile ? imgFile.filename : (r.existing_image || null)
        });
    }
    return retailers;
}

// Resolve a product's display sequence and shift the other products so the
// list stays a gap-free 1..N ordering with no duplicate numbers.
//  - New product  -> inserted at the requested slot, everything at/after it moves down.
//  - Existing one -> moved to the requested slot, the block in between slides by one.
// An empty / invalid / too-large value parks the product at the end of the list.
// Returns the final integer sequence to store on the product itself.
async function applyProductSequence(requestedValue, { productId = null, transaction } = {}) {
    const total = await Product.count({ transaction });
    let requested = parseInt(requestedValue, 10);

    if (productId) {
        // ----- Editing an existing product: reorder within the list -----
        const current = await Product.findByPk(productId, { transaction });
        const oldSeq = current && current.sequence > 0 ? current.sequence : total;

        let newSeq = Number.isFinite(requested) && requested >= 1 ? requested : oldSeq;
        if (newSeq > total) newSeq = total;
        if (newSeq === oldSeq) return oldSeq;

        if (newSeq < oldSeq) {
            // Moving towards the front: push [newSeq, oldSeq - 1] down by one.
            await Product.increment('sequence', {
                by: 1,
                where: { id: { [Op.ne]: productId }, sequence: { [Op.gte]: newSeq, [Op.lt]: oldSeq } },
                transaction
            });
        } else {
            // Moving towards the end: pull [oldSeq + 1, newSeq] up by one.
            await Product.increment('sequence', {
                by: -1,
                where: { id: { [Op.ne]: productId }, sequence: { [Op.gt]: oldSeq, [Op.lte]: newSeq } },
                transaction
            });
        }
        return newSeq;
    }

    // ----- Brand-new product: insert at the requested slot -----
    const lastSlot = total + 1;
    let newSeq = Number.isFinite(requested) && requested >= 1 ? requested : lastSlot;
    if (newSeq > lastSlot) newSeq = lastSlot;

    if (newSeq < lastSlot) {
        await Product.increment('sequence', {
            by: 1,
            where: { sequence: { [Op.gte]: newSeq } },
            transaction
        });
    }
    return newSeq;
}

const adminController = {
    // ==================== DASHBOARD ====================
getDashboard: async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/auth/login');
        }

        const totalOrders = await Order.count();
        const totalProducts = await Product.count();
        const totalUsers = await User.count();
        const totalCategories = await Category.count();

        const totalRevenue = await Order.sum('total', {
            where: { order_status: 'delivered' }
        }) || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = await Order.sum('total', {
            where: {
                created_at: { [Op.gte]: today },
                order_status: { [Op.ne]: 'cancelled' }
            }
        }) || 0;

        const pendingOrders = await Order.count({ where: { order_status: 'pending' } });
        const processingOrders = await Order.count({ where: { order_status: 'processing' } });
        const deliveredOrders = await Order.count({ where: { order_status: 'delivered' } });
        const cancelledOrders = await Order.count({ where: { order_status: 'cancelled' } });

        // ==================== LOW STOCK PRODUCTS WITH VARIATIONS ====================
        const allProducts = await Product.findAll({
            where: { is_active: true },
            include: [{ model: ProductVariation, as: 'variations' }]
        });
        
        const lowStockProducts = [];
        for (const product of allProducts) {
            if (product.has_variations && product.variations && product.variations.length > 0) {
                // Show each variation separately in low stock
                for (const variation of product.variations) {
                    if (variation.stock < 10 && variation.stock >= 0) {
                        lowStockProducts.push({
                            id: product.id,
                            variation_id: variation.id,
                            name: `${product.name} (${variation.variation_slug || 'Variant'})`,
                            stock: variation.stock,
                            price: variation.price,
                            is_variation: true
                        });
                    }
                }
            } else {
                // Simple product
                const totalStock = product.stock || 0;
                if (totalStock < 10 && totalStock >= 0) {
                    lowStockProducts.push({
                        id: product.id,
                        variation_id: null,
                        name: product.name,
                        stock: totalStock,
                        price: product.price,
                        is_variation: false
                    });
                }
            }
        }
        
        // Sort by stock ascending and limit to 10
        lowStockProducts.sort((a, b) => a.stock - b.stock);
        const limitedLowStockProducts = lowStockProducts.slice(0, 15);

        // ==================== RECENT ORDERS ====================
        const recentOrders = await Order.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'mobile']
            }],
            attributes: ['id', 'order_number', 'total', 'order_status', 'payment_method', 'created_at']
        });

        // ==================== RECENT PRODUCTS WITH VARIATIONS ====================
        const recentProductsData = await Product.findAll({
            limit: 15,
            order: [['created_at', 'DESC']],
            include: [
                { model: Category, as: 'category', attributes: ['name'] },
                { model: ProductVariation, as: 'variations' }
            ],
            attributes: ['id', 'name', 'price', 'stock', 'is_active', 'created_at', 'has_variations', 'images']
        });
        
        // Process products to show all variations
        const recentProducts = [];
        for (const product of recentProductsData) {
            const productData = product.toJSON();
            
            if (productData.has_variations && productData.variations && productData.variations.length > 0) {
                // Show each variation as separate row
                for (const variation of productData.variations) {
                    recentProducts.push({
                        id: productData.id,
                        variation_id: variation.id,
                        name: `${productData.name} (${variation.variation_slug || 'Variant'})`,
                        category: productData.category,
                        price: variation.price,
                        stock: variation.stock,
                        has_variations: true,
                        is_variation: true,
                        stockStatus: variation.stock === 0 ? 'out_of_stock' : (variation.stock < 10 ? 'low_stock' : 'in_stock'),
                        stockStatusText: variation.stock === 0 ? 'Out of Stock' : (variation.stock < 10 ? 'Low Stock' : 'In Stock'),
                        stockBadge: variation.stock === 0 ? 'badge-outstock' : (variation.stock < 10 ? 'badge-lowstock' : 'badge-instock'),
                        is_active: productData.is_active,
                        image: variation.images?.[0] || productData.images?.[0],
                        variation_slug: variation.variation_slug
                    });
                }
            } else {
                // Simple product
                recentProducts.push({
                    id: productData.id,
                    variation_id: null,
                    name: productData.name,
                    category: productData.category,
                    price: productData.price,
                    stock: productData.stock,
                    has_variations: false,
                    is_variation: false,
                    stockStatus: productData.stock === 0 ? 'out_of_stock' : (productData.stock < 10 ? 'low_stock' : 'in_stock'),
                    stockStatusText: productData.stock === 0 ? 'Out of Stock' : (productData.stock < 10 ? 'Low Stock' : 'In Stock'),
                    stockBadge: productData.stock === 0 ? 'badge-outstock' : (productData.stock < 10 ? 'badge-lowstock' : 'badge-instock'),
                    is_active: productData.is_active,
                    image: productData.images?.[0]
                });
            }
        }

        // ==================== TOP SELLING PRODUCTS ====================
        const topSellingProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                'variation_id',
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.total')), 'total_amount']
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'images', 'price', 'compare_price']
                },
                {
                    model: ProductVariation,
                    as: 'variation',
                    attributes: ['id', 'price', 'variation_slug']
                }
            ],
            group: ['product_id', 'variation_id', 'product.id', 'variation.id'],
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: 15
        });

        // Process top selling products
        const processedTopSelling = topSellingProducts.map(item => {
            const productData = item.product.toJSON();
            const variationData = item.variation;
            const displayName = variationData 
                ? `${productData.name} (${variationData.variation_slug || 'Variant'})`
                : productData.name;
            
            return {
                id: productData.id,
                variation_id: item.variation_id,
                name: displayName,
                image: variationData?.images?.[0] || productData.images?.[0],
                price: variationData ? parseFloat(variationData.price) : parseFloat(productData.price),
                compare_price: productData.compare_price ? parseFloat(productData.compare_price) : null,
                total_quantity: parseInt(item.dataValues.total_quantity),
                total_amount: parseFloat(item.dataValues.total_amount),
                discount_percentage: productData.compare_price && parseFloat(productData.compare_price) > (variationData ? parseFloat(variationData.price) : parseFloat(productData.price))
                    ? Math.round(((parseFloat(productData.compare_price) - (variationData ? parseFloat(variationData.price) : parseFloat(productData.price))) / parseFloat(productData.compare_price)) * 100)
                    : 0
            };
        });

        // Get top selling products for this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const topSellingThisMonth = await OrderItem.findAll({
            attributes: [
                'product_id',
                'variation_id',
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.total')), 'total_amount']
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'images', 'price']
                },
                {
                    model: ProductVariation,
                    as: 'variation',
                    attributes: ['id', 'price', 'variation_slug']
                },
                {
                    model: Order,
                    as: 'order',
                    where: {
                        created_at: { [Op.gte]: startOfMonth },
                        order_status: 'delivered'
                    },
                    attributes: []
                }
            ],
            group: ['product_id', 'variation_id', 'product.id', 'variation.id'],
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: 10
        });

        const processedTopSellingThisMonth = topSellingThisMonth.map(item => {
            const productData = item.product.toJSON();
            const variationData = item.variation;
            const displayName = variationData 
                ? `${productData.name} (${variationData.variation_slug || 'Variant'})`
                : productData.name;
            
            return {
                id: productData.id,
                variation_id: item.variation_id,
                name: displayName,
                total_quantity: parseInt(item.dataValues.total_quantity),
                total_amount: parseFloat(item.dataValues.total_amount)
            };
        });

        // Get revenue by payment method
        const revenueByPaymentMethod = await Order.findAll({
            attributes: [
                'payment_method',
                [sequelize.fn('SUM', sequelize.col('total')), 'total_amount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
            ],
            where: { order_status: 'delivered' },
            group: ['payment_method'],
            order: [[sequelize.literal('total_amount'), 'DESC']]
        });

        // Get orders by day (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            
            const dailyOrders = await Order.findAll({
                where: {
                    created_at: { [Op.between]: [date, nextDate] },
                    order_status: 'delivered'
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('total')), 'total']
                ]
            });
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                amount: dailyOrders[0]?.dataValues.total || 0,
                orders: await Order.count({
                    where: {
                        created_at: { [Op.between]: [date, nextDate] }
                    }
                })
            });
        }

        res.render('dashboard', {
            title: 'Dashboard',
            admin: req.session.admin,
            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalCategories,
                totalRevenue,
                todaySales,
                pendingOrders,
                processingOrders,
                deliveredOrders,
                cancelledOrders
            },
            recentOrders,
            recentProducts,
            lowStockProducts: limitedLowStockProducts,
            topSellingProducts: processedTopSelling,
            topSellingThisMonth: processedTopSellingThisMonth,
            revenueByPaymentMethod,
            last7Days
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard: ' + error.message);
    }
},

    // ==================== CATEGORIES ====================
    getCategories: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const categories = await Category.findAndCountAll({
                order: [['sort_order', 'ASC'], ['name', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            for (let category of categories.rows) {
                const productCount = await Product.count({
                    where: { category_id: category.id }
                });
                category.dataValues.product_count = productCount;
            }

            res.render('admin/categories/list', {
                title: 'Categories',
                admin: req.session.admin,
                categories: categories.rows,
                pagination: {
                    total: categories.count,
                    page: parseInt(page),
                    pages: Math.ceil(categories.count / limit)
                }
            });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).send('Error loading categories');
        }
    },

    getAddCategory: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            res.render('admin/categories/form', {
                title: 'Add Category',
                admin: req.session.admin,
                category: null
            });
        } catch (error) {
            console.error('Add category form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    getEditCategory: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return res.redirect('/admin/categories');
            }

            res.render('admin/categories/form', {
                title: 'Edit Category',
                admin: req.session.admin,
                category: category
            });
        } catch (error) {
            console.error('Edit category form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    addCategory: async (req, res) => {
        try {
            const { name, description, sort_order, status } = req.body;
            const image = req.file ? req.file.filename : null;

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            await Category.create({
                name,
                slug,
                description,
                image,
                sort_order: sort_order || 0,
                status: status || 'active'
            });

            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).send('Error creating category');
        }
    },

    updateCategory: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return res.redirect('/admin/categories');
            }

            const { name, description, sort_order, status } = req.body;
            const updateData = { name, description, sort_order, status };

            if (name !== category.name) {
                updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            if (req.file) {
                updateData.image = req.file.filename;
            }

            await category.update(updateData);
            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).send('Error updating category');
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);
            if (category) {
                const productCount = await Product.count({
                    where: { category_id: category.id }
                });

                if (productCount > 0) {
                    return res.status(400).send('Cannot delete category with products');
                }

                await category.destroy();
            }
            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).send('Error deleting category');
        }
    },

    // ==================== ATTRIBUTES MANAGEMENT ====================
    getAttributes: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/admin/auth/login');

            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const attributes = await Attribute.findAndCountAll({
                include: [{ model: AttributeValue, as: 'values' }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            res.render('admin/attributes/list', {
                title: 'Product Attributes',
                admin: req.session.admin,
                attributes: attributes.rows,
                pagination: {
                    total: attributes.count,
                    page: parseInt(page),
                    pages: Math.ceil(attributes.count / limit)
                }
            });
        } catch (error) {
            console.error('Get attributes error:', error);
            res.status(500).send('Error loading attributes');
        }
    },

    getAddAttribute: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/admin/auth/login');

            res.render('admin/attributes/form', {
                title: 'Add Attribute',
                admin: req.session.admin,
                attribute: null
            });
        } catch (error) {
            console.error('Add attribute form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    getEditAttribute: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/admin/auth/login');

            const attribute = await Attribute.findByPk(req.params.id, {
                include: [{ model: AttributeValue, as: 'values' }]
            });

            if (!attribute) return res.redirect('/admin/products/attributes');

            res.render('admin/attributes/form', {
                title: 'Edit Attribute',
                admin: req.session.admin,
                attribute
            });
        } catch (error) {
            console.error('Edit attribute form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    addAttribute: async (req, res) => {
        try {
            const { name, type, is_global, status, values } = req.body;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const attribute = await Attribute.create({
                name,
                slug,
                type: type || 'select',
                is_global: is_global === 'true' || is_global === true,
                status: status || 'active'
            });

            if (values && values.trim()) {
                const valueArray = values.split(',').map(v => v.trim());
                for (let i = 0; i < valueArray.length; i++) {
                    await AttributeValue.create({
                        attribute_id: attribute.id,
                        value: valueArray[i],
                        sort_order: i
                    });
                }
            }

            res.redirect('/admin/products/attributes');
        } catch (error) {
            console.error('Create attribute error:', error);
            res.status(500).send('Error creating attribute');
        }
    },

updateAttribute: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const attribute = await Attribute.findByPk(req.params.id);
        if (!attribute) return res.redirect('/admin/products/attributes');

        const { name, type, is_global, status, values } = req.body;
        const updateData = { 
            name, 
            type, 
            status, 
            is_global: is_global === 'true' || is_global === true 
        };

        if (name !== attribute.name) {
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        await attribute.update(updateData, { transaction });

        // Update attribute values if provided
        if (values && values.trim()) {
            const newValueArray = values.split(',').map(v => v.trim()).filter(v => v);
            
            // Get existing values
            const existingValues = await AttributeValue.findAll({
                where: { attribute_id: attribute.id },
                transaction
            });
            
            const existingValueMap = new Map();
            existingValues.forEach(v => {
                existingValueMap.set(v.value.toLowerCase(), v);
            });
            
            const newValueSet = new Set(newValueArray.map(v => v.toLowerCase()));
            
            // Find values to delete (exist in DB but not in new list)
            const valuesToDelete = existingValues.filter(v => !newValueSet.has(v.value.toLowerCase()));
            
            // Check if any values to delete are being used in product variations
            if (valuesToDelete.length > 0) {
                const valueIdsToDelete = valuesToDelete.map(v => v.id);
                
                const usedValues = await ProductVariationAttribute.findAll({
                    where: {
                        attribute_value_id: { [Op.in]: valueIdsToDelete }
                    },
                    attributes: ['attribute_value_id'],
                    transaction
                });
                
                if (usedValues.length > 0) {
                    await transaction.rollback();
                    const usedValueIds = new Set(usedValues.map(u => u.attribute_value_id));
                    const usedValueNames = valuesToDelete
                        .filter(v => usedValueIds.has(v.id))
                        .map(v => v.value)
                        .join(', ');
                    
                    return res.status(400).send(`
                        Cannot delete attribute values that are currently in use by products: ${usedValueNames}. 
                        Please remove these values from products first.
                        <br><br>
                        <a href="/admin/products/attributes/edit/${attribute.id}">Go Back</a>
                    `);
                }
                
                // Delete unused values
                if (valuesToDelete.length > 0) {
                    await AttributeValue.destroy({
                        where: {
                            id: { [Op.in]: valuesToDelete.map(v => v.id) }
                        },
                        transaction
                    });
                }
            }
            
            // Update or create values
            for (let i = 0; i < newValueArray.length; i++) {
                const newValue = newValueArray[i];
                const existingValue = existingValues.find(v => v.value.toLowerCase() === newValue.toLowerCase());
                
                if (existingValue) {
                    // Update existing value (if sort_order changed)
                    if (existingValue.sort_order !== i) {
                        await existingValue.update({ sort_order: i }, { transaction });
                    }
                } else {
                    // Create new value
                    await AttributeValue.create({
                        attribute_id: attribute.id,
                        value: newValue,
                        sort_order: i
                    }, { transaction });
                }
            }
        }
        
        await transaction.commit();
        res.redirect('/admin/products/attributes');
        
    } catch (error) {
        await transaction.rollback();
        console.error('Update attribute error:', error);
        res.status(500).send('Error updating attribute: ' + error.message);
    }
},

    deleteAttribute: async (req, res) => {
        try {
            const attribute = await Attribute.findByPk(req.params.id);
            if (attribute) {
                await attribute.destroy();
            }
            res.redirect('/admin/products/attributes');
        } catch (error) {
            console.error('Delete attribute error:', error);
            res.status(500).send('Error deleting attribute');
        }
    },

    addAttributeValue: async (req, res) => {
        try {
            const { attribute_id, value, color_code } = req.body;

            await AttributeValue.create({
                attribute_id,
                value,
                color_code: color_code || null,
                sort_order: 0
            });

            res.redirect(`/admin/products/attributes/edit/${attribute_id}`);
        } catch (error) {
            console.error('Add attribute value error:', error);
            res.status(500).send('Error adding attribute value');
        }
    },

    deleteAttributeValue: async (req, res) => {
        try {
            const value = await AttributeValue.findByPk(req.params.id);
            if (value) {
                const attributeId = value.attribute_id;
                await value.destroy();
                res.redirect(`/admin/products/attributes/edit/${attributeId}`);
            } else {
                res.redirect('/admin/products/attributes');
            }
        } catch (error) {
            console.error('Delete attribute value error:', error);
            res.status(500).send('Error deleting attribute value');
        }
    },

    getAttributeValues: async (req, res) => {
        try {
            const { attribute_ids } = req.body;
            const result = [];

            for (let attrId of attribute_ids) {
                const attribute = await Attribute.findByPk(attrId);
                const values = await AttributeValue.findAll({
                    where: { attribute_id: attrId },
                    order: [['sort_order', 'ASC']]
                });

                result.push({
                    attribute_id: attrId,
                    attribute_name: attribute.name,
                    attribute_type: attribute.type,
                    values: values
                });
            }

            res.json(result);
        } catch (error) {
            console.error('Get attribute values error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ==================== PRODUCTS ====================
    getProducts: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const { page = 1, limit = 20, search } = req.query;
            const offset = (page - 1) * limit;
            const where = {};

            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { sku: { [Op.like]: `%${search}%` } }
                ];
            }

            const products = await Product.findAndCountAll({
                where,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['sequence', 'ASC'], ['created_at', 'DESC']]
            });

            // For each product, get variations if needed
            const processedProducts = [];
            for (let product of products.rows) {
                const productData = product.toJSON();

                if (productData.has_variations) {
                    // Get variations for this product
                    const variations = await ProductVariation.findAll({
                        where: { product_id: product.id },
                        attributes: ['price', 'stock']
                    });

                    if (variations && variations.length > 0) {
                        const prices = variations.map(v => parseFloat(v.price));
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);

                        if (minPrice === maxPrice) {
                            productData.displayPrice = `₹${minPrice.toLocaleString('en-IN')}`;
                        } else {
                            productData.displayPrice = `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
                        }

                        const totalStock = variations.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
                        productData.displayStock = totalStock;

                        if (totalStock === 0) {
                            productData.stockBadge = 'badge-outstock';
                            productData.stockStatusText = 'Out of Stock';
                        } else if (totalStock < 10) {
                            productData.stockBadge = 'badge-lowstock';
                            productData.stockStatusText = 'Low Stock';
                        } else {
                            productData.stockBadge = 'badge-instock';
                            productData.stockStatusText = 'In Stock';
                        }

                        productData.variationsCount = variations.length;
                    } else {
                        productData.displayPrice = '₹0';
                        productData.displayStock = 0;
                        productData.stockBadge = 'badge-outstock';
                        productData.stockStatusText = 'Out of Stock';
                        productData.variationsCount = 0;
                    }
                } else {
                    productData.displayPrice = `₹${parseFloat(productData.price).toLocaleString('en-IN')}`;
                    productData.displayStock = productData.stock;

                    if (productData.stock === 0) {
                        productData.stockBadge = 'badge-outstock';
                        productData.stockStatusText = 'Out of Stock';
                    } else if (productData.stock < 10) {
                        productData.stockBadge = 'badge-lowstock';
                        productData.stockStatusText = 'Low Stock';
                    } else {
                        productData.stockBadge = 'badge-instock';
                        productData.stockStatusText = 'In Stock';
                    }
                }

                processedProducts.push(productData);
            }

            res.render('admin/products/list', {
                title: 'Products',
                admin: req.session.admin,
                products: processedProducts,
                pagination: {
                    total: products.count,
                    page: parseInt(page),
                    pages: Math.ceil(products.count / limit)
                },
                search
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).send('Error loading products');
        }
    },

    getAddProduct: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const categories = await Category.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            const globalAttributes = await Attribute.findAll({
                where: { status: 'active', is_global: true },
                include: [{ model: AttributeValue, as: 'values' }]
            });

            const productCount = await Product.count();

            res.render('admin/products/form', {
                title: 'Add Product',
                admin: req.session.admin,
                product: null,
                categories,
                globalAttributes,
                nextSequence: productCount + 1,  // pre-fill: next number after the last product
                variations: [],  // Add empty array for add mode
                productAttributes: []  // Add empty array for add mode
            });
        } catch (error) {
            console.error('Add product form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    addProduct: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const {
                name, description, short_description, category_id, slug: customSlug,
                price, compare_price, stock, gst_rate,
                product_type, cost_per_item, weight, is_featured,
                is_online, sequence
            } = req.body;

            const images = req.files ? req.files.filter(f => f.fieldname === 'images').map(file => file.filename) : [];
            const productVideos = req.files ? req.files.filter(f => f.fieldname === 'product_videos').map(file => file.filename) : [];
            const onlineRetailers = buildRetailers(req.body.retailers, req.files, 'online_img_');

            // Compress videos in background (non-blocking)
            compressVideos(productVideos, '../public/uploads/products/');

            let slug = customSlug;
            if (!slug || slug.trim() === '') {
                slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            } else {
                slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
            }

            const existingProduct = await Product.findOne({ where: { slug: slug } });
            if (existingProduct) {
                slug = `${slug}-${Date.now()}`;
            }

            // Calculate base_price (price without GST). CGST/SGST/IGST are derived from
            // this single rate; which pair actually applies is decided per-order based on
            // the shipping state (see utils/gst.js), not here.
            const totalGstRate = parseFloat(gst_rate) || 0;
            const { cgst_rate, sgst_rate, igst_rate } = splitGstRate(totalGstRate);
            const finalPrice = parseFloat(price) || 0;
            let basePrice = finalPrice;

            if (totalGstRate > 0) {
                basePrice = (finalPrice * 100) / (100 + totalGstRate);
            }

            // Place the product in the display order (shifts the others if needed).
            const finalSequence = await applyProductSequence(sequence, { transaction });

            const productData = {
                name,
                slug,
                description,
                short_description,
                category_id: parseInt(category_id),
                images,
                product_videos: productVideos,
                sequence: finalSequence,
                is_active: true,
                is_featured: is_featured === 'on' || is_featured === 'true',
                has_variations: product_type === 'variable',
                price: finalPrice,
                base_price: basePrice,
                compare_price: compare_price ? parseFloat(compare_price) : null,
                stock: product_type === 'simple' ? (parseInt(stock) || 0) : 0,
                cgst_rate,
                sgst_rate,
                igst_rate,
                cost_per_item: cost_per_item ? parseFloat(cost_per_item) : null,
                weight: weight ? parseFloat(weight) : null,
                is_online: is_online === 'true' || is_online === 'on',
                online_retailers: onlineRetailers
            };

            const product = await Product.create(productData, { transaction });

            if (product_type === 'variable' && req.body.variations) {
                const variations = req.body.variations;

                for (let index in variations) {
                    const variation = variations[index];

                    const variationImages = req.files ? req.files.filter(f => f.fieldname === `variation_images_${index}`).map(f => f.filename) : [];
                    const variationVideos = req.files ? req.files.filter(f => f.fieldname === `variation_videos_${index}`).map(f => f.filename) : [];
                    compressVideos(variationVideos, '../public/uploads/products/variations/');
                    const varOnlineRetailers = buildRetailers(variation.retailers, req.files, `var_online_img_${index}_`);

                    // Calculate variation base_price
                    const variationTotalGst = parseFloat(variation.gst_rate) || 0;
                    const variationGstRates = splitGstRate(variationTotalGst);
                    const variationFinalPrice = parseFloat(variation.price) || 0;
                    let variationBasePrice = variationFinalPrice;

                    if (variationTotalGst > 0) {
                        variationBasePrice = (variationFinalPrice * 100) / (100 + variationTotalGst);
                    }

                    const productVariation = await ProductVariation.create({
                        product_id: product.id,
                        sku: null,
                        price: variationFinalPrice,
                        base_price: variationBasePrice,
                        compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                        stock: parseInt(variation.stock) || 0,
                        images: variationImages,
                        videos: variationVideos,
                        cgst_rate: variationGstRates.cgst_rate,
                        sgst_rate: variationGstRates.sgst_rate,
                        igst_rate: variationGstRates.igst_rate,
                        cost_per_item: variation.cost_per_item ? parseFloat(variation.cost_per_item) : null,
                        weight: variation.weight ? parseFloat(variation.weight) : null,
                        is_online: variation.is_online === 'true' || variation.is_online === 'on',
                        online_retailers: varOnlineRetailers
                    }, { transaction });

                    const { ProductVariationAttribute } = require('../models');

                    // Build variation_slug from attributes
                    let variationSlug = product.slug;
                    const attributeValues = [];

                    for (let key in variation) {
                        if (key.startsWith('attribute_')) {
                            const attributeValueId = variation[key];
                            const attributeId = key.replace('attribute_', '');

                            await ProductVariationAttribute.create({
                                variation_id: productVariation.id,
                                attribute_id: parseInt(attributeId),
                                attribute_value_id: parseInt(attributeValueId)
                            }, { transaction });

                            // Get attribute value for slug
                            const attributeValue = await AttributeValue.findByPk(attributeValueId);
                            if (attributeValue && attributeValue.value) {
                                const valueSlug = attributeValue.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/^-|-$/g, '');
                                attributeValues.push(valueSlug);
                            }
                        }
                    }

                    // Create variation_slug
                    if (attributeValues.length > 0) {
                        variationSlug = `${product.slug}-${attributeValues.join('-')}`;
                    }

                    // Update variation with slug
                    await productVariation.update({ variation_slug: variationSlug }, { transaction });
                }
            }

            await transaction.commit();
            res.redirect('/admin/products');
        } catch (error) {
            await transaction.rollback();
            console.error('Create product error:', error);
            res.status(500).send('Error creating product: ' + error.message);
        }
    },
    getEditProduct: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.redirect('/admin/products');
            }

            const categories = await Category.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            const globalAttributes = await Attribute.findAll({
                where: { status: 'active', is_global: true },
                include: [{ model: AttributeValue, as: 'values' }]
            });

            let variations = [];
            let productAttributes = [];

            if (product.has_variations) {
                // Get all variations for this product
                variations = await ProductVariation.findAll({
                    where: { product_id: product.id }
                });

                // For each variation, get its attribute values
                for (let variation of variations) {
                    const variationAttributes = await ProductVariationAttribute.findAll({
                        where: { variation_id: variation.id },
                        include: [
                            { model: Attribute, as: 'attribute' },
                            { model: AttributeValue, as: 'attribute_value' }
                        ]
                    });

                    variation.dataValues.attributes = variationAttributes;
                    variation.dataValues.base_price_display = variation.base_price ? `₹${parseFloat(variation.base_price).toFixed(2)}` : '';

                    for (let va of variationAttributes) {
                        if (va.attribute && !productAttributes.find(a => a.id === va.attribute.id)) {
                            const attr = await Attribute.findByPk(va.attribute.id, {
                                include: [{ model: AttributeValue, as: 'values' }]
                            });
                            if (attr) {
                                productAttributes.push(attr);
                            }
                        }
                    }
                }
            }

            res.render('admin/products/form', {
                title: 'Edit Product',
                admin: req.session.admin,
                product: product,
                categories: categories,
                globalAttributes: globalAttributes,
                nextSequence: product.sequence || 0,
                variations: variations,
                productAttributes: productAttributes,
                hasVariations: product.has_variations
            });
        } catch (error) {
            console.error('Edit product form error:', error);
            res.status(500).send('Error loading form: ' + error.message);
        }
    },

 updateProduct: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.redirect('/admin/products');
        }

        const {
            name, description, short_description, category_id,
            price, compare_price, stock, gst_rate,
            product_type, cost_per_item, weight, is_featured,
            existing_images,
            existing_videos,
            is_online, sequence
        } = req.body;

        // Handle images - start with existing images if provided
        let images = [];
        if (existing_images && existing_images.trim()) {
            images = existing_images.split(',');
        } else if (product.images && product.images.length > 0 && !existing_images) {
            // If no existing_images param but product has images, keep them
            images = product.images;
        }

        // Add new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.filter(f => f.fieldname === 'images').map(file => file.filename);
            images = [...images, ...newImages];
        }

        // Handle videos - start with existing videos if provided
        let productVideos = [];
        if (existing_videos && existing_videos.trim()) {
            productVideos = existing_videos.split(',');
        } else if (product.product_videos && product.product_videos.length > 0 && !existing_videos) {
            productVideos = product.product_videos;
        }

        // Add new videos
        if (req.files && req.files.length > 0) {
            const newVideos = req.files.filter(f => f.fieldname === 'product_videos').map(file => file.filename);
            if (newVideos.length > 0) {
                compressVideos(newVideos, '../public/uploads/products/');
                productVideos = [...productVideos, ...newVideos];
            }
        }

        const onlineRetailers = buildRetailers(req.body.retailers, req.files, 'online_img_');

        // Calculate base_price for simple product
        const totalGstRate = parseFloat(gst_rate) || 0;
        const { cgst_rate, sgst_rate, igst_rate } = splitGstRate(totalGstRate);
        const finalPrice = parseFloat(price) || 0;
        let basePrice = finalPrice;

        if (totalGstRate > 0) {
            basePrice = (finalPrice * 100) / (100 + totalGstRate);
        }

        const updateData = {
            name,
            description,
            short_description,
            category_id: parseInt(category_id),
            images,
            product_videos: productVideos,
            is_featured: is_featured === 'on' || is_featured === 'true',
            has_variations: product_type === 'variable',
            is_online: is_online === 'true' || is_online === 'on',
            online_retailers: onlineRetailers
        };

        if (name !== product.name) {
            let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const existingProduct = await Product.findOne({
                where: { slug: slug, id: { [Op.ne]: product.id } }
            });
            if (existingProduct) {
                slug = `${slug}-${Date.now()}`;
            }
            updateData.slug = slug;
        }

        if (product_type === 'simple') {
            updateData.price = finalPrice;
            updateData.base_price = basePrice;
            updateData.compare_price = compare_price ? parseFloat(compare_price) : null;
            updateData.stock = parseInt(stock) || 0;
            updateData.cgst_rate = cgst_rate;
            updateData.sgst_rate = sgst_rate;
            updateData.igst_rate = igst_rate;
            updateData.cost_per_item = cost_per_item ? parseFloat(cost_per_item) : null;
            updateData.weight = weight ? parseFloat(weight) : null;
        }

        // Re-position the product in the display order (shifts the others if needed).
        updateData.sequence = await applyProductSequence(sequence, { productId: product.id, transaction });

        await product.update(updateData, { transaction });

        if (product_type === 'variable') {
            if (req.body.variations) {
                const keepVariationIds = [];
                const variations = req.body.variations;

                for (let index in variations) {
                    const variation = variations[index];
                    const variationId = variation.id ? parseInt(variation.id) : null;

                    if (variationId) {
                        keepVariationIds.push(variationId);
                    }
                }

                await ProductVariation.destroy({
                    where: {
                        product_id: product.id,
                        id: { [Op.notIn]: keepVariationIds }
                    },
                    transaction
                });

                for (let index in variations) {
                    const variation = variations[index];
                    const variationId = variation.id ? parseInt(variation.id) : null;

                    // Handle variation images/videos - get existing ones
                    let variationImages = [];
                    let variationVideos = [];
                    if (variationId) {
                        const existingVariation = await ProductVariation.findByPk(variationId, { transaction });
                        if (existingVariation && existingVariation.images) {
                            variationImages = existingVariation.images;
                        }
                        if (existingVariation && existingVariation.videos) {
                            variationVideos = existingVariation.videos;
                        }
                    }

                    // Add new variation images
                    if (req.files) {
                        const newVariationImages = req.files.filter(f => f.fieldname === `variation_images_${index}`).map(f => f.filename);
                        variationImages = [...variationImages, ...newVariationImages];

                        const newVariationVideos = req.files.filter(f => f.fieldname === `variation_videos_${index}`).map(f => f.filename);
                        if (newVariationVideos.length > 0) {
                            compressVideos(newVariationVideos, '../public/uploads/products/variations/');
                            variationVideos = [...variationVideos, ...newVariationVideos];
                        }
                    }

                    const varOnlineRetailers = buildRetailers(variation.retailers, req.files, `var_online_img_${index}_`);

                    // Calculate variation base_price
                    const variationTotalGst = parseFloat(variation.gst_rate) || 0;
                    const variationGstRates = splitGstRate(variationTotalGst);
                    const variationFinalPrice = parseFloat(variation.price) || 0;
                    let variationBasePrice = variationFinalPrice;

                    if (variationTotalGst > 0) {
                        variationBasePrice = (variationFinalPrice * 100) / (100 + variationTotalGst);
                    }

                    let productVariation;
                    let attributeValues = [];

                    if (variationId) {
                        productVariation = await ProductVariation.findByPk(variationId, { transaction });
                        if (productVariation) {
                            await productVariation.update({
                                price: variationFinalPrice,
                                base_price: variationBasePrice,
                                compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                                stock: parseInt(variation.stock) || 0,
                                images: variationImages,
                                videos: variationVideos,
                                cgst_rate: variationGstRates.cgst_rate,
                                sgst_rate: variationGstRates.sgst_rate,
                                igst_rate: variationGstRates.igst_rate,
                                cost_per_item: variation.cost_per_item ? parseFloat(variation.cost_per_item) : null,
                                weight: variation.weight ? parseFloat(variation.weight) : null,
                                is_online: variation.is_online === 'true' || variation.is_online === 'on',
                                online_retailers: varOnlineRetailers
                            }, { transaction });
                        }
                    } else {
                        productVariation = await ProductVariation.create({
                            product_id: product.id,
                            sku: null,
                            price: variationFinalPrice,
                            base_price: variationBasePrice,
                            compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                            stock: parseInt(variation.stock) || 0,
                            images: variationImages,
                            videos: variationVideos,
                            cgst_rate: variationGstRates.cgst_rate,
                            sgst_rate: variationGstRates.sgst_rate,
                            igst_rate: variationGstRates.igst_rate,
                            cost_per_item: variation.cost_per_item ? parseFloat(variation.cost_per_item) : null,
                            weight: variation.weight ? parseFloat(variation.weight) : null,
                            is_online: variation.is_online === 'true' || variation.is_online === 'on',
                            online_retailers: varOnlineRetailers
                        }, { transaction });
                    }

                    if (productVariation) {
                        if (variationId) {
                            await ProductVariationAttribute.destroy({
                                where: { variation_id: productVariation.id },
                                transaction
                            });
                        }

                        // Build variation_slug from attributes
                        let variationSlug = product.slug;
                        attributeValues = [];

                        for (let key in variation) {
                            if (key.startsWith('attribute_')) {
                                const attributeValueId = variation[key];
                                const attributeId = key.replace('attribute_', '');

                                await ProductVariationAttribute.create({
                                    variation_id: productVariation.id,
                                    attribute_id: parseInt(attributeId),
                                    attribute_value_id: parseInt(attributeValueId)
                                }, { transaction });

                                // Get attribute value for slug
                                const attributeValue = await AttributeValue.findByPk(attributeValueId);
                                if (attributeValue && attributeValue.value) {
                                    const valueSlug = attributeValue.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, '-')
                                        .replace(/^-|-$/g, '');
                                    attributeValues.push(valueSlug);
                                }
                            }
                        }

                        // Create variation_slug
                        if (attributeValues.length > 0) {
                            variationSlug = `${product.slug}-${attributeValues.join('-')}`;
                            await productVariation.update({ variation_slug: variationSlug }, { transaction });
                        }
                    }
                }
            }
        } else {
            await ProductVariation.destroy({ where: { product_id: product.id }, transaction });
        }

        await transaction.commit();
        res.redirect('/admin/products');
    } catch (error) {
        await transaction.rollback();
        console.error('Update product error:', error);
        res.status(500).send('Error updating product: ' + error.message);
    }
},
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (product) {
                const removedSeq = product.sequence;
                await product.destroy();
                // Close the gap so the ordering stays 1..N.
                if (removedSeq > 0) {
                    await Product.increment('sequence', {
                        by: -1,
                        where: { sequence: { [Op.gt]: removedSeq } }
                    });
                }
            }
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).send('Error deleting product');
        }
    },

deleteProductImage: async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const imageToRemove = req.params.image;
        const currentImages = product.images || [];
        
        // Check if image exists
        if (!currentImages.includes(imageToRemove)) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        
        // Remove image from array
        const updatedImages = currentImages.filter(img => img !== imageToRemove);
        
        // Update product
        await product.update({ images: updatedImages });
        
        // Optional: Delete the physical file from server
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../public/uploads/products/', imageToRemove);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete product image error:', error);
        res.status(500).json({ success: false, message: 'Error deleting image' });
    }
},

deleteVariationImage: async (req, res) => {
    try {
        const variation = await ProductVariation.findByPk(req.params.variationId);
        if (!variation) {
            return res.status(404).json({ success: false, message: 'Variation not found' });
        }

        const imageToRemove = req.params.imageName;
        const currentImages = variation.images || [];

        if (!currentImages.includes(imageToRemove)) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        const updatedImages = currentImages.filter(img => img !== imageToRemove);
        await variation.update({ images: updatedImages });

        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../public/uploads/products/variations/', imageToRemove);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ success: true, message: 'Variation image deleted successfully' });
    } catch (error) {
        console.error('Delete variation image error:', error);
        res.status(500).json({ success: false, message: 'Error deleting variation image' });
    }
},

reorderVariationImages: async (req, res) => {
    try {
        const variation = await ProductVariation.findByPk(req.params.variationId);
        if (!variation) {
            return res.status(404).json({ success: false, message: 'Variation not found' });
        }

        const currentImages = variation.images || [];
        const newOrder = Array.isArray(req.body.images) ? req.body.images : [];

        // Only accept a reordering of the images that already exist on this variation
        const isSameSet = newOrder.length === currentImages.length &&
            newOrder.every(img => currentImages.includes(img));

        if (!isSameSet) {
            return res.status(400).json({ success: false, message: 'Invalid image order' });
        }

        await variation.update({ images: newOrder });

        res.json({ success: true, message: 'Variation image order updated' });
    } catch (error) {
        console.error('Reorder variation image error:', error);
        res.status(500).json({ success: false, message: 'Error updating variation image order' });
    }
},

deleteProductVideo: async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const videoToRemove = req.params.video;
        const currentVideos = product.product_videos || [];

        if (!currentVideos.includes(videoToRemove)) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const updatedVideos = currentVideos.filter(v => v !== videoToRemove);
        await product.update({ product_videos: updatedVideos });

        const videoPath = path.join(__dirname, '../public/uploads/products/', videoToRemove);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }

        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete product video error:', error);
        res.status(500).json({ success: false, message: 'Error deleting video' });
    }
},

deleteVariationVideo: async (req, res) => {
    try {
        const variation = await ProductVariation.findByPk(req.params.variationId);
        if (!variation) {
            return res.status(404).json({ success: false, message: 'Variation not found' });
        }

        const videoToRemove = req.params.videoName;
        const currentVideos = variation.videos || [];

        if (!currentVideos.includes(videoToRemove)) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const updatedVideos = currentVideos.filter(v => v !== videoToRemove);
        await variation.update({ videos: updatedVideos });

        const videoPath = path.join(__dirname, '../public/uploads/products/variations/', videoToRemove);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }

        res.json({ success: true, message: 'Variation video deleted successfully' });
    } catch (error) {
        console.error('Delete variation video error:', error);
        res.status(500).json({ success: false, message: 'Error deleting variation video' });
    }
},

reorderVariationVideos: async (req, res) => {
    try {
        const variation = await ProductVariation.findByPk(req.params.variationId);
        if (!variation) {
            return res.status(404).json({ success: false, message: 'Variation not found' });
        }

        const currentVideos = variation.videos || [];
        const newOrder = Array.isArray(req.body.videos) ? req.body.videos : [];

        // Only accept a reordering of the videos that already exist on this variation
        const isSameSet = newOrder.length === currentVideos.length &&
            newOrder.every(vid => currentVideos.includes(vid));

        if (!isSameSet) {
            return res.status(400).json({ success: false, message: 'Invalid video order' });
        }

        await variation.update({ videos: newOrder });

        res.json({ success: true, message: 'Variation video order updated' });
    } catch (error) {
        console.error('Reorder variation video error:', error);
        res.status(500).json({ success: false, message: 'Error updating variation video order' });
    }
},

    toggleProductStatus: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (product) {
                await product.update({ is_active: !product.is_active });
                res.json({ success: true, is_active: product.is_active });
            } else {
                res.status(404).json({ success: false });
            }
        } catch (error) {
            console.error('Toggle product status error:', error);
            res.status(500).json({ success: false });
        }
    },

    // Add/remove a single section tag (new-launch / bestseller / elite) on a product,
    // independent of the other sections' tags.
    toggleProductTag: async (req, res) => {
        const ALLOWED_TAGS = ['new-launch', 'bestseller', 'elite'];
        try {
            const { tag } = req.body;
            if (!ALLOWED_TAGS.includes(tag)) {
                return res.status(400).json({ success: false, message: 'Invalid tag' });
            }

            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false });
            }

            const currentTags = Array.isArray(product.tags) ? product.tags : [];
            const hasTag = currentTags.includes(tag);
            const newTags = hasTag
                ? currentTags.filter(t => t !== tag)
                : [...currentTags, tag];

            await product.update({ tags: newTags });
            res.json({ success: true, tags: newTags, active: !hasTag });
        } catch (error) {
            console.error('Toggle product tag error:', error);
            res.status(500).json({ success: false });
        }
    },

    // ==================== ORDERS ====================
   // ==================== ORDERS ====================
getOrders: async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/auth/login');
        }

        const { 
            page = 1, 
            limit = 20, 
            status, 
            payment_status,
            payment_method,
            date_range,
            start_date,
            end_date,
            min_amount,
            max_amount,
            customer_type,
            sort_by = 'newest',
            search 
        } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};
        const userWhere = {};

        // 1. Order Status Filter
        if (status && status !== 'all') {
            where.order_status = status;
        }

        // 2. Payment Status Filter
        if (payment_status && payment_status !== 'all') {
            where.payment_status = payment_status;
        }

        // 3. Payment Method Filter
        if (payment_method && payment_method !== 'all') {
            where.payment_method = payment_method;
        }

        // 4. Date Range Filter
        if (date_range) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch(date_range) {
                case 'today':
                    where.created_at = { [Op.gte]: today };
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    where.created_at = { [Op.gte]: weekAgo };
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    where.created_at = { [Op.gte]: monthAgo };
                    break;
                case 'this_month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    where.created_at = { [Op.gte]: startOfMonth };
                    break;
                case 'custom':
                    if (start_date && end_date) {
                        where.created_at = {
                            [Op.between]: [new Date(start_date), new Date(end_date)]
                        };
                    }
                    break;
            }
        }

        // 5. Price Range Filter
        if (min_amount || max_amount) {
            where.total = {};
            if (min_amount) where.total[Op.gte] = parseFloat(min_amount);
            if (max_amount) where.total[Op.lte] = parseFloat(max_amount);
        }

        // 6. Customer Type Filter
        if (customer_type === 'registered') {
            userWhere.id = { [Op.ne]: null };
        } else if (customer_type === 'guest') {
            userWhere.id = null;
        }

        // Search Filter
        if (search) {
            where[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } },
                { shipping_phone: { [Op.like]: `%${search}%` } },
                { shipping_name: { [Op.like]: `%${search}%` } }
            ];
        }

        // Sort Options
        let order = [];
        switch(sort_by) {
            case 'oldest':
                order = [['created_at', 'ASC']];
                break;
            case 'highest_amount':
                order = [['total', 'DESC']];
                break;
            case 'lowest_amount':
                order = [['total', 'ASC']];
                break;
            default:
                order = [['created_at', 'DESC']];
        }

        const orders = await Order.findAndCountAll({
            where,
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['id', 'name', 'email', 'mobile'],
                where: Object.keys(userWhere).length ? userWhere : undefined,
                required: customer_type === 'registered' ? true : (customer_type === 'guest' ? false : undefined)
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order,
            distinct: true
        });

        // Get summary statistics for filters
        const summary = {
            total: await Order.count(),
            pending: await Order.count({ where: { order_status: 'pending' } }),
            processing: await Order.count({ where: { order_status: 'processing' } }),
            delivered: await Order.count({ where: { order_status: 'delivered' } }),
            cancelled: await Order.count({ where: { order_status: 'cancelled' } }),
            totalRevenue: await Order.sum('total', { where: { order_status: 'delivered' } }) || 0,
            avgOrderValue: await Order.sum('total') / await Order.count() || 0
        };

        res.render('admin/orders/list', {
            title: 'Orders',
            admin: req.session.admin,
            orders: orders.rows,
            pagination: {
                total: orders.count,
                page: parseInt(page),
                pages: Math.ceil(orders.count / limit),
                limit: parseInt(limit)
            },
            filters: {
                status: status || 'all',
                payment_status: payment_status || 'all',
                payment_method: payment_method || 'all',
                date_range: date_range || '',
                start_date: start_date || '',
                end_date: end_date || '',
                min_amount: min_amount || '',
                max_amount: max_amount || '',
                customer_type: customer_type || 'all',
                sort_by: sort_by || 'newest',
                search: search || ''
            },
            summary
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).send('Error loading orders');
    }
},

    getOrder: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'user', attributes: ['id', 'name', 'email', 'mobile', 'address'] },
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [
                            { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
                            { model: ProductVariation, as: 'variation' }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.redirect('/admin/orders');
            }

            res.render('admin/orders/view', {
                title: `Order #${order.order_number}`,
                admin: req.session.admin,
                order
            });
        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).send('Error loading order');
        }
    },

    getOrderInvoice: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const order = await Order.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'user', attributes: ['id', 'name', 'email', 'mobile', 'address'] },
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [
                            { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
                            { model: ProductVariation, as: 'variation' }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.redirect('/admin/orders');
            }

            res.render('admin/orders/invoice', {
                title: `Invoice #${order.order_number}`,
                order
            });
        } catch (error) {
            console.error('Get order invoice error:', error);
            res.status(500).send('Error loading invoice');
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findByPk(req.params.id);

            if (!order) {
                return res.redirect('/admin/orders');
            }

            const updateData = { order_status: status };

            if (status === 'delivered') {
                updateData.delivered_at = new Date();
            } else if (status === 'cancelled') {
                updateData.cancelled_at = new Date();
            }

            await order.update(updateData);
            res.redirect(`/admin/orders/view/${order.id}`);
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).send('Error updating order');
        }
    },

    // ==================== USERS ====================
    getUsers: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const { page = 1, limit = 20, search, status } = req.query;
            const offset = (page - 1) * limit;
            const where = {};

            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { mobile: { [Op.like]: `%${search}%` } }
                ];
            }

            if (status && status !== 'all') {
                where.status = status;
            }

            const users = await User.findAndCountAll({
                where,
                attributes: { exclude: ['password', 'device_token'] },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            for (let user of users.rows) {
                const orderCount = await Order.count({
                    where: { user_id: user.id }
                });
                user.dataValues.order_count = orderCount;
            }

            res.render('admin/users/list', {
                title: 'Customers',
                admin: req.session.admin,
                users: users.rows,
                pagination: {
                    total: users.count,
                    page: parseInt(page),
                    pages: Math.ceil(users.count / limit)
                },
                search,
                currentStatus: status || 'all'
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).send('Error loading users');
        }
    },

    getUser: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const user = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password', 'device_token'] }
            });

            if (!user) {
                return res.redirect('/admin/users');
            }

            const orders = await Order.findAll({
                where: { user_id: user.id },
                limit: 20,
                order: [['created_at', 'DESC']],
                include: [{ model: OrderItem, as: 'items' }]
            });

            res.render('admin/users/view', {
                title: `Customer: ${user.name}`,
                admin: req.session.admin,
                user,
                orders
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).send('Error loading user');
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { status } = req.body;
            await User.update({ status }, { where: { id: req.params.id } });
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Update user status error:', error);
            res.status(500).send('Error updating user');
        }
    },
// Add this function in adminController.js
bulkUpdateOrders: async (req, res) => {
    try {
        const { order_ids, status } = req.body;
        
        if (!order_ids || !order_ids.length) {
            return res.status(400).json({ success: false, message: 'No orders selected' });
        }
        
        await Order.update(
            { order_status: status },
            { where: { id: { [Op.in]: order_ids } } }
        );
        
        res.json({ success: true, message: `${order_ids.length} orders updated successfully` });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},

// Export to Excel
exportOrders: async (req, res) => {
    try {
        const { status, payment_status, date_range, start_date, end_date } = req.query;
        const where = {};
        
        if (status && status !== 'all') where.order_status = status;
        if (payment_status && payment_status !== 'all') where.payment_status = payment_status;
        
        if (date_range === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            where.created_at = { [Op.gte]: today };
        } else if (date_range === 'custom' && start_date && end_date) {
            where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };
        }
        
        const orders = await Order.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'mobile'] }],
            order: [['created_at', 'DESC']]
        });
        
        // Generate CSV
        const csvData = orders.map(order => ({
            'Order ID': order.order_number,
            'Customer Name': order.user ? order.user.name : 'Guest',
            'Email': order.user ? order.user.email : '',
            'Mobile': order.user ? order.user.mobile : order.shipping_phone,
            'Amount': order.total,
            'Payment Method': order.payment_method,
            'Payment Status': order.payment_status,
            'Order Status': order.order_status,
            'Date': new Date(order.created_at).toLocaleString()
        }));
        
        res.json({ success: true, data: csvData });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},

   getBanners: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const banners = await Banner.findAll({
                order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
            });

            res.render('admin/banners/list', {
                title: 'Banners',
                admin: req.session.admin,
                banners: banners
            });
        } catch (error) {
            console.error('Get banners error:', error);
            res.status(500).send('Error loading banners');
        }
    },

    getAddBanner: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            res.render('admin/banners/form', {
                title: 'Add Banner',
                admin: req.session.admin,
                banner: null
            });
        } catch (error) {
            console.error('Add banner form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    getEditBanner: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const banner = await Banner.findByPk(req.params.id);
            if (!banner) {
                return res.redirect('/admin/banners');
            }

            res.render('admin/banners/form', {
                title: 'Edit Banner',
                admin: req.session.admin,
                banner: banner
            });
        } catch (error) {
            console.error('Edit banner form error:', error);
            res.status(500).send('Error loading form');
        }
    },

 addBanner: async (req, res) => {
    console.log('FILES:', req.files);
console.log('BODY:', req.body);
    try {
        const { title, description, media_type, link, sort_order, status } = req.body;
        
        let image = null;
        let video = null;
        let video_poster = null;
console.log('media_type',media_type);

        if (media_type === 'image') {
            if (req.files && req.files['image']) {
                const uploadedFile = req.files['image'][0];
                const uploadedPath = uploadedFile.path;
                const compressedPath = await compressImage(uploadedPath);
                image = path.basename(compressedPath);
            }
            if (!image) {
                return res.status(400).send('Banner image is required');
            }
        } else if (media_type === 'video') {
            if (req.files && req.files['video']) {
                video = req.files['video'][0].filename;
            }
            if (!video) {
                return res.status(400).send('Banner video is required');
            }
            if (req.files && req.files['video_poster']) {
                video_poster = req.files['video_poster'][0].filename;
            }
        }

        await Banner.create({
            title,
            description: description || null,
            media_type: media_type || 'image',
            image: image,
            video: video,
            video_poster: video_poster,
            link: link || null,
            sort_order: parseInt(sort_order) || 0,
            status: status || 'active'
        });

        res.redirect('/admin/banners');
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).send('Error creating banner: ' + error.message);
    }
},

 updateBanner: async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        if (!banner) {
            return res.redirect('/admin/banners');
        }

        const { title, description, media_type, link, sort_order, status } = req.body;
        
        const updateData = {
            title: title,
            description: description || null,
            media_type: media_type || 'image',
            link: link || null,
            sort_order: parseInt(sort_order) || 0,
            status: status || 'active'
        };

        // Handle based on media type
        if (media_type === 'image') {
            // For image type
            if (req.files && req.files['image']) {
                // Delete old image if exists
                if (banner.image) {
                    const oldImagePath = path.join(__dirname, '../public/uploads/banners/', banner.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                const uploadedPath = req.files['image'][0].path;
                const compressedPath = await compressImage(uploadedPath);
                updateData.image = path.basename(compressedPath);
                // Clear video fields
                updateData.video = null;
                updateData.video_poster = null;
            } else {
                // Keep existing image, clear video fields
                updateData.image = banner.image;
                updateData.video = null;
                updateData.video_poster = null;
            }
        } else if (media_type === 'video') {
            // For video type
            if (req.files && req.files['video']) {
                // Delete old video if exists
                if (banner.video) {
                    const oldVideoPath = path.join(__dirname, '../public/uploads/banners/', banner.video);
                    if (fs.existsSync(oldVideoPath)) {
                        fs.unlinkSync(oldVideoPath);
                    }
                }
                updateData.video = req.files['video'][0].filename;
                // Clear image field
                updateData.image = null;
            } else {
                // Keep existing video, clear image
                updateData.video = banner.video;
                updateData.image = null;
            }

            // Handle video poster
            if (req.files && req.files['video_poster']) {
                // Delete old poster if exists
                if (banner.video_poster) {
                    const oldPosterPath = path.join(__dirname, '../public/uploads/banners/', banner.video_poster);
                    if (fs.existsSync(oldPosterPath)) {
                        fs.unlinkSync(oldPosterPath);
                    }
                }
                updateData.video_poster = req.files['video_poster'][0].filename;
            } else {
                updateData.video_poster = banner.video_poster;
            }
        }

        await banner.update(updateData);
        res.redirect('/admin/banners');
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).send('Error updating banner: ' + error.message);
    }
},

    deleteBanner: async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id);
            if (banner) {
                // Delete image file
                if (banner.image) {
                    const imagePath = path.join(__dirname, '../../public/uploads/banners/', banner.image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                // Delete video file
                if (banner.video) {
                    const videoPath = path.join(__dirname, '../../public/uploads/banners/', banner.video);
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath);
                    }
                }
                // Delete video poster
                if (banner.video_poster) {
                    const posterPath = path.join(__dirname, '../../public/uploads/banners/', banner.video_poster);
                    if (fs.existsSync(posterPath)) {
                        fs.unlinkSync(posterPath);
                    }
                }
                await banner.destroy();
            }
            res.redirect('/admin/banners');
        } catch (error) {
            console.error('Delete banner error:', error);
            res.status(500).send('Error deleting banner');
        }
    },

    toggleBannerStatus: async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id);
            if (banner) {
                await banner.update({ status: banner.status === 'active' ? 'inactive' : 'active' });
                res.json({ success: true, status: banner.status });
            } else {
                res.status(404).json({ success: false });
            }
        } catch (error) {
            console.error('Toggle banner status error:', error);
            res.status(500).json({ success: false });
        }
    },

    // ========== Shop The Look ==========
    getShopTheLook: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const items = await ShopTheLook.findAll({
                order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
            });

            res.render('admin/shop-the-look/list', {
                title: 'Shop The Look',
                admin: req.session.admin,
                items: items
            });
        } catch (error) {
            console.error('Get shop the look error:', error);
            res.status(500).send('Error loading Shop The Look items');
        }
    },

    getAddShopTheLook: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            res.render('admin/shop-the-look/form', {
                title: 'Add Shop The Look Image',
                admin: req.session.admin,
                item: null
            });
        } catch (error) {
            console.error('Add shop the look form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    getEditShopTheLook: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const item = await ShopTheLook.findByPk(req.params.id);
            if (!item) {
                return res.redirect('/admin/shop-the-look');
            }

            res.render('admin/shop-the-look/form', {
                title: 'Edit Shop The Look Image',
                admin: req.session.admin,
                item: item
            });
        } catch (error) {
            console.error('Edit shop the look form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    addShopTheLook: async (req, res) => {
        try {
            const { label, link, sort_order, status } = req.body;

            if (!req.file) {
                return res.status(400).send('Image is required');
            }

            const uploadedPath = req.file.path;
            const compressedPath = await compressImage(uploadedPath);

            await ShopTheLook.create({
                label: label || null,
                image: path.basename(compressedPath),
                link: link || null,
                sort_order: parseInt(sort_order) || 0,
                status: status || 'active'
            });

            res.redirect('/admin/shop-the-look');
        } catch (error) {
            console.error('Create shop the look error:', error);
            res.status(500).send('Error creating item: ' + error.message);
        }
    },

    updateShopTheLook: async (req, res) => {
        try {
            const item = await ShopTheLook.findByPk(req.params.id);
            if (!item) {
                return res.redirect('/admin/shop-the-look');
            }

            const { label, link, sort_order, status } = req.body;

            const updateData = {
                label: label || null,
                link: link || null,
                sort_order: parseInt(sort_order) || 0,
                status: status || 'active'
            };

            if (req.file) {
                if (item.image) {
                    const oldImagePath = path.join(__dirname, '../public/uploads/shop-the-look/', item.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                const compressedPath = await compressImage(req.file.path);
                updateData.image = path.basename(compressedPath);
            }

            await item.update(updateData);
            res.redirect('/admin/shop-the-look');
        } catch (error) {
            console.error('Update shop the look error:', error);
            res.status(500).send('Error updating item: ' + error.message);
        }
    },

    deleteShopTheLook: async (req, res) => {
        try {
            const item = await ShopTheLook.findByPk(req.params.id);
            if (item) {
                if (item.image) {
                    const imagePath = path.join(__dirname, '../public/uploads/shop-the-look/', item.image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                await item.destroy();
            }
            res.redirect('/admin/shop-the-look');
        } catch (error) {
            console.error('Delete shop the look error:', error);
            res.status(500).send('Error deleting item');
        }
    },

    toggleShopTheLookStatus: async (req, res) => {
        try {
            const item = await ShopTheLook.findByPk(req.params.id);
            if (item) {
                await item.update({ status: item.status === 'active' ? 'inactive' : 'active' });
                res.json({ success: true, status: item.status });
            } else {
                res.status(404).json({ success: false });
            }
        } catch (error) {
            console.error('Toggle shop the look status error:', error);
            res.status(500).json({ success: false });
        }
    },

    // ========== Hogaa In Motion ==========
    getHogaaInMotion: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const items = await HogaaInMotion.findAll({
                order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
            });

            res.render('admin/hogaa-in-motion/list', {
                title: 'Hogaa In Motion',
                admin: req.session.admin,
                items: items
            });
        } catch (error) {
            console.error('Get hogaa in motion error:', error);
            res.status(500).send('Error loading Hogaa In Motion items');
        }
    },

    getAddHogaaInMotion: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            res.render('admin/hogaa-in-motion/form', {
                title: 'Add Hogaa In Motion GIF',
                admin: req.session.admin,
                item: null
            });
        } catch (error) {
            console.error('Add hogaa in motion form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    getEditHogaaInMotion: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.redirect('/admin/auth/login');
            }

            const item = await HogaaInMotion.findByPk(req.params.id);
            if (!item) {
                return res.redirect('/admin/hogaa-in-motion');
            }

            res.render('admin/hogaa-in-motion/form', {
                title: 'Edit Hogaa In Motion GIF',
                admin: req.session.admin,
                item: item
            });
        } catch (error) {
            console.error('Edit hogaa in motion form error:', error);
            res.status(500).send('Error loading form');
        }
    },

    // Supports uploading any number of GIFs at once - one row is created per file.
    // GIFs are saved as-is (never run through compressImage/sharp, which would
    // flatten them to a static webp and kill the animation).
    addHogaaInMotion: async (req, res) => {
        try {
            const { title, link, sort_order, status } = req.body;

            if (!req.files || req.files.length === 0) {
                return res.status(400).send('At least one GIF is required');
            }

            const baseSortOrder = parseInt(sort_order) || 0;

            await HogaaInMotion.bulkCreate(req.files.map((file, index) => ({
                title: title || null,
                image: file.filename,
                link: link || null,
                sort_order: baseSortOrder + index,
                status: status || 'active'
            })));

            res.redirect('/admin/hogaa-in-motion');
        } catch (error) {
            console.error('Create hogaa in motion error:', error);
            res.status(500).send('Error creating item: ' + error.message);
        }
    },

    updateHogaaInMotion: async (req, res) => {
        try {
            const item = await HogaaInMotion.findByPk(req.params.id);
            if (!item) {
                return res.redirect('/admin/hogaa-in-motion');
            }

            const { title, link, sort_order, status } = req.body;

            const updateData = {
                title: title || null,
                link: link || null,
                sort_order: parseInt(sort_order) || 0,
                status: status || 'active'
            };

            if (req.file) {
                if (item.image) {
                    const oldImagePath = path.join(__dirname, '../public/uploads/hogaa-in-motion/', item.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updateData.image = req.file.filename;
            }

            await item.update(updateData);
            res.redirect('/admin/hogaa-in-motion');
        } catch (error) {
            console.error('Update hogaa in motion error:', error);
            res.status(500).send('Error updating item: ' + error.message);
        }
    },

    deleteHogaaInMotion: async (req, res) => {
        try {
            const item = await HogaaInMotion.findByPk(req.params.id);
            if (item) {
                if (item.image) {
                    const imagePath = path.join(__dirname, '../public/uploads/hogaa-in-motion/', item.image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                await item.destroy();
            }
            res.redirect('/admin/hogaa-in-motion');
        } catch (error) {
            console.error('Delete hogaa in motion error:', error);
            res.status(500).send('Error deleting item');
        }
    },

    toggleHogaaInMotionStatus: async (req, res) => {
        try {
            const item = await HogaaInMotion.findByPk(req.params.id);
            if (item) {
                await item.update({ status: item.status === 'active' ? 'inactive' : 'active' });
                res.json({ success: true, status: item.status });
            } else {
                res.status(404).json({ success: false });
            }
        } catch (error) {
            console.error('Toggle hogaa in motion status error:', error);
            res.status(500).json({ success: false });
        }
    }
};

module.exports = adminController;
