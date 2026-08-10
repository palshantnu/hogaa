const { User, Product, Category, Cart, CartItem, Order, OrderItem, ProductVariation, Attribute, AttributeValue, ProductVariationAttribute, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const firebaseAdmin = require('../firebase/firebaseAdmin');

async function updateCartTotals(cartId) {
    const cartItems = await CartItem.findAll({
        where: { cart_id: cartId }
    });

    const total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const total = subtotal;

    await Cart.update(
        {
            total_items: total_items,
            subtotal: subtotal,
            total: total
        },
        { where: { id: cartId } }
    );
}

const userController = {
    // ==================== AUTHENTICATION ====================
    register: async (req, res) => {
        try {
            const { name, email, mobile, password, address, city, state, pincode } = req.body;

            if (!name || !email || !mobile || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, mobile, and password are required'
                });
            }

            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }

            const existingMobile = await User.findOne({ where: { mobile } });
            if (existingMobile) {
                return res.status(409).json({ success: false, message: 'Mobile number already registered' });
            }

            const user = await User.create({
                name, email, mobile, password, address, city, state, pincode, status: 'active'
            });

            req.session.user = {
                id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: 'user'
            };

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: user.getPublicData()
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { mobile, password } = req.body;

            if (!mobile || !password) {
                return res.status(400).json({ success: false, message: 'Mobile and password are required' });
            }

            const user = await User.findOne({ where: { mobile } });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ success: false, message: 'Your account is blocked' });
            }

            const isValid = await user.validatePassword(password);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }

            await user.update({ last_login: new Date() });

            req.session.user = {
                id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: 'user'
            };

            res.json({
                success: true,
                message: 'Login successful',
                user: user.getPublicData()
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }
            res.json({ success: true, message: 'Logout successful' });
        });
    },

    sendOtp: async (req, res) => {
        try {
            const { mobile } = req.body;
            if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
                return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
            }

            return res.json({
                success: true,
                message: 'OTP is handled by Firebase client authentication'
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { mobile, firebaseToken } = req.body;
            if (!mobile || !firebaseToken) {
                return res.status(400).json({ success: false, message: 'Mobile and Firebase token required' });
            }
            if (!/^[0-9]{10}$/.test(mobile)) {
                return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
            }

            const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
            const firebasePhone = decodedToken.phone_number || '';
            if (firebasePhone !== "+91" + mobile) {
                return res.status(401).json({ success: false, message: 'Firebase phone verification failed' });
            }

            let user = await User.findOne({ where: { mobile } });
            if (!user) {
                user = await User.create({
                    name: 'User',
                    email: `${mobile}@hogaa.temp`,
                    mobile,
                    password: crypto.randomBytes(16).toString('hex'),
                    status: 'active',
                    mobile_verified: true
                });
            } else {
                await user.update({ mobile_verified: true, last_login: new Date() });
            }

            req.session.user = { id: user.id, name: user.name, mobile: user.mobile, role: 'user' };

            return res.json({
                success: true,
                message: 'Login successful',
                user: user.getPublicData()
            });
        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const { user_id } = req.query;
            
            if (!user_id) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({ success: true, user: user.getPublicData() });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { user_id, name, email, mobile, address, city, state, pincode, gender } = req.body;
            
            if (!user_id) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if (email && email !== user.email) {
                const existing = await User.findOne({ where: { email } });
                if (existing) {
                    return res.status(409).json({ success: false, message: 'Email already used' });
                }
            }

            await user.update({ 
                name: name || user.name,
                email: email || user.email,
                mobile: mobile || user.mobile,
                address: address || user.address,
                city: city || user.city,
                state: state || user.state,
                pincode: pincode || user.pincode,
                gender: gender || user.gender
            });

            res.json({ 
                success: true, 
                message: 'Profile updated successfully',
                user: user.getPublicData()
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // ==================== PRODUCTS WITH VARIATIONS ====================

    // Get all products with variations support
  // Get all products with variations as separate items
getProducts: async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            min_price,
            max_price,
            search,
            sort = 'newest',
            show_variations = 'true'
        } = req.query;

        const offset = (page - 1) * limit;
        
        let allProducts = [];
        
        const products = await Product.findAll({
            where: { is_active: true },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { 
                    model: ProductVariation, 
                    as: 'variations',
                    where: { is_active: true },
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        for (const product of products) {
            const productData = product.toJSON();
            
            if (category && productData.category_id != category) continue;
            if (search && !productData.name.toLowerCase().includes(search.toLowerCase())) continue;
            
            if (productData.has_variations && productData.variations && productData.variations.length > 0 && show_variations === 'true') {
                for (const variation of productData.variations) {
                    const variationAttributes = await ProductVariationAttribute.findAll({
                        where: { variation_id: variation.id },
                        include: [
                            { model: Attribute, as: 'attribute' },
                            { model: AttributeValue, as: 'attribute_value' }
                        ]
                    });
                    
                    // Build SEO-friendly slug from attribute values
                    let attributeText = '';
                    let attributeDetails = {};
                    let slugSuffix = '';
                    
                    for (const va of variationAttributes) {
                        const valueText = va.attribute_value.value;
                        attributeText += `${valueText} `;
                        attributeDetails[va.attribute.name] = valueText;
                        
                        // Create SEO-friendly slug suffix
                        const valueSlug = valueText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        slugSuffix += `-${valueSlug}`;
                    }
                    
                    // Generate SEO-friendly slug (remove ID, use attribute values)
                    const seoSlug = `${productData.slug}${slugSuffix}`;
                    
                    const variationProduct = {
                        id: productData.id,
                        variation_id: variation.id,
                        name: `${productData.name}${attributeText ? ` (${attributeText.trim()})` : ''}`,
                        slug: seoSlug,  // SEO-friendly slug without ID
                        price: parseFloat(variation.price),
                        compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                        images: variation.images && variation.images.length > 0 ? variation.images : productData.images,
                        product_videos: variation.videos && variation.videos.length > 0 ? variation.videos : productData.product_videos,
                        short_description: productData.short_description,
                        stock: variation.stock,
                        stock_status: variation.stock_status,
                        category: productData.category,
                        has_variations: false,
                        is_variation: true,
                        parent_id: productData.id,
                        tags: productData.tags,
                        attributes: attributeDetails,
                        cgst_rate: variation.cgst_rate,
                        sgst_rate: variation.sgst_rate,
                        igst_rate: variation.igst_rate,
                        variation_slug: seoSlug  // Store SEO slug
                    };
                    
                    if (min_price && variationProduct.price < parseFloat(min_price)) continue;
                    if (max_price && variationProduct.price > parseFloat(max_price)) continue;
                    
                    allProducts.push(variationProduct);
                }
            } else {
                const simpleProduct = {
                    id: productData.id,
                    variation_id: null,
                    name: productData.name,
                    slug: productData.slug,
                    price: parseFloat(productData.price),
                    compare_price: productData.compare_price ? parseFloat(productData.compare_price) : null,
                    images: productData.images,
                    product_videos: productData.product_videos,
                    short_description: productData.short_description,
                    stock: productData.stock,
                    stock_status: productData.stock_status,
                    category: productData.category,
                    has_variations: productData.has_variations,
                    is_variation: false,
                    parent_id: null,
                    tags: productData.tags,
                    cgst_rate: productData.cgst_rate,
                    sgst_rate: productData.sgst_rate,
                    igst_rate: productData.igst_rate
                };
                
                if (min_price && simpleProduct.price < parseFloat(min_price)) continue;
                if (max_price && simpleProduct.price > parseFloat(max_price)) continue;
                
                allProducts.push(simpleProduct);
            }
        }
        
        switch (sort) {
            case 'price_low': allProducts.sort((a, b) => a.price - b.price); break;
            case 'price_high': allProducts.sort((a, b) => b.price - a.price); break;
            default: break;
        }
        
        const total = allProducts.length;
        const paginatedProducts = allProducts.slice(offset, offset + parseInt(limit));
        
        const productsWithDiscount = paginatedProducts.map(product => {
            let discountPercentage = 0;
            if (product.compare_price && parseFloat(product.compare_price) > product.price) {
                discountPercentage = Math.round(((parseFloat(product.compare_price) - product.price) / parseFloat(product.compare_price)) * 100);
            }
            return {
                ...product,
                discount_percentage: discountPercentage,
                original_price: product.compare_price
            };
        });
        
        res.json({
            success: true,
            products: productsWithDiscount,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) }
        });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},  

    // Get single product with variations
// Get single product with all variations
getProductById: async (req, res) => {
    try {
        const { slug } = req.params;
        
        if (!slug || slug === 'undefined' || slug === 'null') {
            return res.status(400).json({ success: false, message: 'Invalid product slug' });
        }
        
        let product;
        let selectedVariation = null;
        
        // FIRST: Try to find variation by variation_slug
        const variation = await ProductVariation.findOne({
            where: { variation_slug: slug, is_active: true }
        });
        
        if (variation) {
            // Get the parent product
            product = await Product.findOne({
                where: { id: variation.product_id, is_active: true }
            });
            selectedVariation = variation;
        } else {
            // SECOND: Try to find product by regular slug
            product = await Product.findOne({
                where: { slug: slug, is_active: true }
            });
        }
        
        if (!product || !product.is_active) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        await product.increment('views');
        
        // Get all variations for this product
        const variations = await ProductVariation.findAll({
            where: { product_id: product.id, is_active: true }
        });
        
        // Get attributes and variations with full details
        const variationsWithAttributes = [];
        const availableAttributes = new Map();
        
        for (const variation of variations) {
            const variationAttributes = await ProductVariationAttribute.findAll({
                where: { variation_id: variation.id },
                include: [
                    { model: Attribute, as: 'attribute' },
                    { model: AttributeValue, as: 'attribute_value' }
                ]
            });
            
            const attributes = {};
            let variationSeoSlug = product.slug;
            
            for (const va of variationAttributes) {
                const valueSlug = va.attribute_value.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                
                attributes[va.attribute.name] = {
                    attribute_id: va.attribute.id,
                    attribute_name: va.attribute.name,
                    value_id: va.attribute_value.id,
                    value: va.attribute_value.value,
                    color_code: va.attribute_value.color_code,
                    slug_value: valueSlug
                };
                
                variationSeoSlug += `-${valueSlug}`;
                
                if (!availableAttributes.has(va.attribute.name)) {
                    availableAttributes.set(va.attribute.name, {
                        attribute_id: va.attribute.id,
                        attribute_name: va.attribute.name,
                        values: []
                    });
                }
                const attrData = availableAttributes.get(va.attribute.name);
                if (!attrData.values.find(v => v.id === va.attribute_value.id)) {
                    attrData.values.push({
                        id: va.attribute_value.id,
                        value: va.attribute_value.value,
                        color_code: va.attribute_value.color_code,
                        slug_value: valueSlug
                    });
                }
            }
            
            variationsWithAttributes.push({
                variation_id: variation.id,
                sku: variation.sku,
                price: parseFloat(variation.price),
                compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                stock: variation.stock,
                stock_status: variation.stock_status,
                images: variation.images && variation.images.length > 0 ? variation.images : product.images,
                videos: variation.videos && variation.videos.length > 0 ? variation.videos : product.product_videos,
                is_online: variation.is_online || false,
                online_retailers: variation.online_retailers || [],
                cgst_rate: variation.cgst_rate,
                sgst_rate: variation.sgst_rate,
                igst_rate: variation.igst_rate,
                attributes: attributes,
                variation_slug: variation.variation_slug || variationSeoSlug
            });
        }
        
        const productData = product.toJSON();
        productData.variations = variationsWithAttributes;
        productData.available_attributes = Array.from(availableAttributes.values());
        
        // Calculate price range
        if (variationsWithAttributes.length > 0) {
            const prices = variationsWithAttributes.map(v => v.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            productData.price_range = {
                min: minPrice,
                max: maxPrice,
                display: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`
            };
        }
        
        // If specific variation was selected
        if (selectedVariation) {
            const selectedVarData = variationsWithAttributes.find(v => v.variation_id === selectedVariation.id);
            if (selectedVarData) {
                productData.selected_variation = selectedVarData;
                productData.price = selectedVarData.price;
                productData.compare_price = selectedVarData.compare_price;
                productData.stock = selectedVarData.stock;
                if (selectedVarData.images && selectedVarData.images.length > 0) {
                    productData.images = selectedVarData.images;
                }
                if (selectedVarData.videos && selectedVarData.videos.length > 0) {
                    productData.product_videos = selectedVarData.videos;
                }
            }
        } else if (variationsWithAttributes.length > 0) {
            // Default to first variation
            productData.selected_variation = variationsWithAttributes[0];
            productData.price = variationsWithAttributes[0].price;
            productData.compare_price = variationsWithAttributes[0].compare_price;
            productData.stock = variationsWithAttributes[0].stock;
        }
        
        // Calculate discount
        if (productData.compare_price && parseFloat(productData.compare_price) > parseFloat(productData.price)) {
            productData.discount_percentage = Math.round(((parseFloat(productData.compare_price) - parseFloat(productData.price)) / parseFloat(productData.compare_price)) * 100);
            productData.original_price = productData.compare_price;
        } else {
            productData.discount_percentage = 0;
            productData.original_price = null;
        }
        
        // Get related products - IMPROVED with variations
        const relatedProductsData = await Product.findAll({
            where: {
                category_id: product.category_id,
                id: { [Op.ne]: product.id },
                is_active: true
            },
            limit: 8,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductVariation, as: 'variations', required: false }
            ]
        });
        
        // Process related products to include variation info
        const relatedProducts = relatedProductsData.map(relProduct => {
            const relProductData = relProduct.toJSON();
            
            // Calculate price range for variable products
            if (relProductData.has_variations && relProductData.variations && relProductData.variations.length > 0) {
                const prices = relProductData.variations.map(v => parseFloat(v.price));
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                relProductData.display_price = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
                relProductData.price = minPrice;
                relProductData.has_variations = true;
                relProductData.variation_count = relProductData.variations.length;
            } else {
                relProductData.display_price = `₹${parseFloat(relProductData.price)}`;
                relProductData.has_variations = false;
            }
            
            // Calculate discount
            if (relProductData.compare_price && parseFloat(relProductData.compare_price) > parseFloat(relProductData.price)) {
                relProductData.discount_percentage = Math.round(((parseFloat(relProductData.compare_price) - parseFloat(relProductData.price)) / parseFloat(relProductData.compare_price)) * 100);
            } else {
                relProductData.discount_percentage = 0;
            }
            
            // Get first variation image if available
            if (relProductData.has_variations && relProductData.variations && relProductData.variations.length > 0) {
                const firstVariation = relProductData.variations[0];
                if (firstVariation.images && firstVariation.images.length > 0) {
                    relProductData.display_image = firstVariation.images[0];
                } else {
                    relProductData.display_image = relProductData.images?.[0];
                }
            } else {
                relProductData.display_image = relProductData.images?.[0];
            }
            
            return {
                id: relProductData.id,
                name: relProductData.name,
                slug: relProductData.slug,
                price: relProductData.price,
                compare_price: relProductData.compare_price,
                display_price: relProductData.display_price,
                images: relProductData.images,
                product_videos: relProductData.product_videos,
                display_image: relProductData.display_image,
                has_variations: relProductData.has_variations,
                variation_count: relProductData.variation_count,
                discount_percentage: relProductData.discount_percentage,
                category: relProductData.category
            };
        });
        
        res.json({
            success: true,
            product: productData,
            related_products: relatedProducts
        });
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
},

    // NEW API: Get variation details by attributes
  // Get variation by selected attributes (for dynamic price/stock update)
 getVariationByAttributes: async (req, res) => {
    try {
        const { product_id, selected_attributes } = req.body;
        
        if (!product_id || !selected_attributes) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and selected attributes are required'
            });
        }
        
        // Get all variations for this product
        const variations = await ProductVariation.findAll({
            where: { product_id: product_id, is_active: true }
        });
        
        let matchingVariation = null;
        
        for (const variation of variations) {
            const variationAttributes = await ProductVariationAttribute.findAll({
                where: { variation_id: variation.id },
                include: [{ model: AttributeValue, as: 'attribute_value' }]
            });
            
            let allMatch = true;
            for (const va of variationAttributes) {
                const selectedValue = selected_attributes[va.attribute_id];
                if (selectedValue && parseInt(selectedValue) !== va.attribute_value_id) {
                    allMatch = false;
                    break;
                }
            }
            
            if (allMatch) {
                matchingVariation = variation;
                break;
            }
        }
        
        if (!matchingVariation) {
            return res.status(404).json({
                success: false,
                message: 'Variation not found for selected attributes'
            });
        }
        
        // Get variation images
        const variationImages = matchingVariation.images && matchingVariation.images.length > 0 
            ? matchingVariation.images 
            : await Product.findByPk(product_id).then(p => p.images);
        
        res.json({
            success: true,
            variation: {
                id: matchingVariation.id,
                price: parseFloat(matchingVariation.price),
                compare_price: matchingVariation.compare_price ? parseFloat(matchingVariation.compare_price) : null,
                stock: matchingVariation.stock,
                stock_status: matchingVariation.stock_status,
                sku: matchingVariation.sku,
                cgst_rate: matchingVariation.cgst_rate,
                sgst_rate: matchingVariation.sgst_rate,
                igst_rate: matchingVariation.igst_rate,
                images: variationImages,
                discount_percentage: matchingVariation.compare_price && parseFloat(matchingVariation.compare_price) > parseFloat(matchingVariation.price)
                    ? Math.round(((parseFloat(matchingVariation.compare_price) - parseFloat(matchingVariation.price)) / parseFloat(matchingVariation.compare_price)) * 100)
                    : 0
            }
        });
        
    } catch (error) {
        console.error('Get variation by attributes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},
    
    // NEW API: Get product variations with their attributes
    getProductVariations: async (req, res) => {
        try {
            const { product_id } = req.params;
            
            const product = await Product.findByPk(product_id, {
                where: { is_active: true }
            });
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            const variations = await ProductVariation.findAll({
                where: { product_id: product_id, is_active: true }
            });
            
            const variationsWithAttributes = [];
            const attributesMap = new Map();
            
            for (const variation of variations) {
                const variationAttributes = await ProductVariationAttribute.findAll({
                    where: { variation_id: variation.id },
                    include: [
                        { model: Attribute, as: 'attribute' },
                        { model: AttributeValue, as: 'attribute_value' }
                    ]
                });
                
                const attrs = {};
                for (const va of variationAttributes) {
                    attrs[va.attribute.id] = {
                        attribute_id: va.attribute.id,
                        attribute_name: va.attribute.name,
                        value_id: va.attribute_value.id,
                        value: va.attribute_value.value,
                        color_code: va.attribute_value.color_code
                    };
                    
                    if (!attributesMap.has(va.attribute.name)) {
                        attributesMap.set(va.attribute.name, {
                            attribute_id: va.attribute.id,
                            attribute_name: va.attribute.name,
                            values: []
                        });
                    }
                    const attrData = attributesMap.get(va.attribute.name);
                    if (!attrData.values.find(v => v.id === va.attribute_value.id)) {
                        attrData.values.push({
                            id: va.attribute_value.id,
                            value: va.attribute_value.value,
                            color_code: va.attribute_value.color_code
                        });
                    }
                }
                
                variationsWithAttributes.push({
                    variation_id: variation.id,
                    price: parseFloat(variation.price),
                    compare_price: variation.compare_price ? parseFloat(variation.compare_price) : null,
                    stock: variation.stock,
                    stock_status: variation.stock_status,
                    sku: variation.sku,
                    cgst_rate: variation.cgst_rate,
                    sgst_rate: variation.sgst_rate,
                    igst_rate: variation.igst_rate,
                    images: variation.images,
                    attributes: attrs
                });
            }
            
            res.json({
                success: true,
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    has_variations: product.has_variations
                },
                attributes: Array.from(attributesMap.values()),
                variations: variationsWithAttributes
            });
            
        } catch (error) {
            console.error('Get product variations error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Quick search products
    quickSearch: async (req, res) => {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json({ success: true, products: [] });
            }

            const products = await Product.findAll({
                where: {
                    is_active: true,
                    [Op.or]: [
                        { name: { [Op.like]: `%${q}%` } },
                        { description: { [Op.like]: `%${q}%` } }
                    ]
                },
                limit: 10,
                attributes: ['id', 'name', 'price', 'compare_price', 'images', 'product_videos', 'slug', 'has_variations']
            });

            res.json({ success: true, products });

        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // ==================== CATEGORIES ====================
    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll({
                where: { status: 'active' },
                attributes: ['id', 'name', 'slug', 'image', 'description'],
                order: [['sort_order', 'ASC'], ['name', 'ASC']]
            });

            res.json({ success: true, categories });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id, {
                where: { status: 'active' },
                attributes: ['id', 'name', 'slug', 'image', 'description']
            });

            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            const products = await Product.findAll({
                where: { category_id: category.id, is_active: true },
                limit: 20,
                attributes: ['id', 'name', 'slug', 'price', 'compare_price', 'images', 'product_videos', 'has_variations']
            });

            res.json({ success: true, category, products });
        } catch (error) {
            console.error('Get category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getProductsByCategory: async (req, res) => {
        try {
            const { categorySlug } = req.params;
            const { page = 1, limit = 20, min_price, max_price, sort = 'newest' } = req.query;

            const offset = (page - 1) * limit;
            
            const category = await Category.findOne({
                where: { slug: categorySlug, status: 'active' }
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const where = { 
                category_id: category.id,
                is_active: true 
            };

            let order = [];
            switch (sort) {
                case 'price_low': order = [['price', 'ASC']]; break;
                case 'price_high': order = [['price', 'DESC']]; break;
                case 'popular': order = [['sold_count', 'DESC']]; break;
                default: order = [['created_at', 'DESC']];
            }

            const products = await Product.findAndCountAll({
                where,
                include: [
                    { 
                        model: ProductVariation, 
                        as: 'variations',
                        where: { is_active: true },
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order,
                distinct: true
            });

            const productsWithInfo = products.rows.map(product => {
                const productData = product.toJSON();
                
                if (productData.has_variations && productData.variations && productData.variations.length > 0) {
                    const prices = productData.variations.map(v => parseFloat(v.price));
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    productData.display_price = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
                    productData.price = minPrice;
                } else {
                    productData.display_price = `₹${parseFloat(productData.price)}`;
                }
                
                if (productData.compare_price && parseFloat(productData.compare_price) > parseFloat(productData.price)) {
                    productData.discount_percentage = Math.round(((parseFloat(productData.compare_price) - parseFloat(productData.price)) / parseFloat(productData.compare_price)) * 100);
                    productData.original_price = productData.compare_price;
                } else {
                    productData.discount_percentage = 0;
                    productData.original_price = null;
                }
                
                return productData;
            });

            res.json({
                success: true,
                category: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image,
                    description: category.description
                },
                products: productsWithInfo,
                pagination: {
                    total: products.count,
                    page: parseInt(page),
                    pages: Math.ceil(products.count / limit),
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Get products by category error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // ==================== CART WITH VARIATIONS ====================

    addToCart: async (req, res) => {
        try {
            const { product_id, variation_id, quantity = 1 } = req.body;
            const user_id = req.body.user_id || req.query.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login first'
                });
            }

            let product, variation, price, stock;

            // Check if it's a variation or simple product
            if (variation_id) {
                variation = await ProductVariation.findOne({
                    where: { id: variation_id, is_active: true },
                    include: [{ model: Product, as: 'product', where: { is_active: true } }]
                });
                
                if (!variation) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product variation not found'
                    });
                }
                
                price = variation.price;
                stock = variation.stock;
                product = variation.product;
            } else {
                product = await Product.findOne({
                    where: { id: product_id, is_active: true }
                });

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found'
                    });
                }
                
                price = product.price;
                stock = product.stock;
            }

            // Check stock
            if (stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available in stock`
                });
            }

            // Get or create cart
            let cart = await Cart.findOne({ where: { user_id: user_id } });

            if (!cart) {
                cart = await Cart.create({
                    user_id: user_id,
                    total_items: 0,
                    subtotal: 0,
                    total: 0
                });
            }

            // Check if item already in cart
            let cartItem = await CartItem.findOne({
                where: {
                    cart_id: cart.id,
                    product_id: product.id,
                    variation_id: variation_id || null
                }
            });

            if (cartItem) {
                const newQuantity = cartItem.quantity + quantity;
                
                if (stock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot add ${quantity} more. Only ${stock - cartItem.quantity} left`
                    });
                }

                await cartItem.update({
                    quantity: newQuantity,
                    total: price * newQuantity
                });
            } else {
                cartItem = await CartItem.create({
                    cart_id: cart.id,
                    product_id: product.id,
                    variation_id: variation_id || null,
                    quantity: quantity,
                    price: price,
                    total: price * quantity
                });
            }

            // Update cart totals
            await updateCartTotals(cart.id);

            res.json({
                success: true,
                message: cartItem ? 'Cart updated successfully' : 'Product added to cart',
                cartItem: {
                    id: cartItem.id,
                    product_id: cartItem.product_id,
                    variation_id: cartItem.variation_id,
                    quantity: cartItem.quantity,
                    price: cartItem.price,
                    total: cartItem.total
                }
            });

        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

 getCart: async (req, res) => {
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const cart = await Cart.findOne({
            where: { user_id: user_id },
            include: [{
                model: CartItem,
                as: 'items',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'slug', 'images', 'stock', 'compare_price', 'price', 'has_variations', 'cgst_rate', 'sgst_rate', 'igst_rate']
                    },
                    {
                        model: ProductVariation,
                        as: 'variation',
                        attributes: ['id', 'price', 'compare_price', 'stock', 'sku', 'variation_slug', 'cgst_rate', 'sgst_rate', 'igst_rate','images']
                    }
                ]
            }]
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.json({
                success: true,
                cart: {
                    items: [],
                    subtotal: 0,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                    tax: 0,
                    shipping: 0,
                    total: 0,
                    item_count: 0,
                    total_items: 0
                }
            });
        }

        let subtotal = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        const items = [];

        for (const item of cart.items) {

     
            
            // Get price from variation or product
            const itemPrice = item.variation ? parseFloat(item.variation.price) : parseFloat(item.price);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;

            // Get GST rates from variation or product
            let cgstRate = 0, sgstRate = 0, igstRate = 0;
            
            if (item.variation) {
                cgstRate = parseFloat(item.variation.cgst_rate) || 0;
                sgstRate = parseFloat(item.variation.sgst_rate) || 0;
                igstRate = parseFloat(item.variation.igst_rate) || 0;
            } else if (item.product) {
                cgstRate = parseFloat(item.product.cgst_rate) || 0;
                sgstRate = parseFloat(item.product.sgst_rate) || 0;
                igstRate = parseFloat(item.product.igst_rate) || 0;
            }

            // Calculate GST amounts for this item
            const itemCgst = (itemTotal * cgstRate) / 100;
            const itemSgst = (itemTotal * sgstRate) / 100;
            const itemIgst = (itemTotal * igstRate) / 100;
            
            totalCgst += itemCgst;
            totalSgst += itemSgst;
            totalIgst += itemIgst;

            let discount = 0;
            let discountPercentage = 0;
            const comparePrice = item.variation ? item.variation.compare_price : item.product?.compare_price;
            
            if (comparePrice && parseFloat(comparePrice) > itemPrice) {
                discount = parseFloat(comparePrice) - itemPrice;
                discountPercentage = Math.round((discount / parseFloat(comparePrice)) * 100);
            }

            // Get variation name (attribute values)
            let variationName = null;
            let variationAttributes = [];
            
            if (item.variation_id) {
                const variationAttributesData = await ProductVariationAttribute.findAll({
                    where: { variation_id: item.variation_id },
                    include: [
                        { model: Attribute, as: 'attribute' },
                        { model: AttributeValue, as: 'attribute_value' }
                    ]
                });
                
                variationAttributes = variationAttributesData.map(va => ({
                    attribute_name: va.attribute.name,
                    attribute_value: va.attribute_value.value,
                    color_code: va.attribute_value.color_code
                }));
                
                variationName = variationAttributes.map(v => v.attribute_value).join(', ');
            }

            items.push({
                id: item.id,
                cartItemId: item.id,
                product_id: item.product_id,
                variation_id: item.variation_id,
                quantity: item.quantity,
                price: itemPrice,
                total: itemTotal,
                discount: discount,
                discount_percentage: discountPercentage,
                variation_name: variationName,
                variation_attributes: variationAttributes,
                gst: {
                    cgst_rate: cgstRate,
                    sgst_rate: sgstRate,
                    igst_rate: igstRate,
                    cgst_amount: itemCgst,
                    sgst_amount: itemSgst,
                    igst_amount: itemIgst
                },
                product: item.product ? {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    images: item.product.images,
                    stock: item.product.stock,
                    has_variations: item.product.has_variations
                } : null,
                variation: item.variation ? {
                    id: item.variation.id,
                    sku: item.variation.sku,
                    variation_slug: item.variation.variation_slug,
                    variation_images: item.variation.images
                } : null
            });
        }

        // Total tax = CGST + SGST + IGST
        const totalTax = totalCgst + totalSgst + totalIgst;
        const shipping = subtotal > 500 ? 0 : 40;
        const total = subtotal + totalTax + shipping;

        res.json({
            success: true,
            cart: {
                items: items,
                subtotal: subtotal,
                cgst: totalCgst,
                totalCgst: totalCgst,
                totalSgst: totalSgst,
                totalIgst: totalIgst,
                tax: totalTax,
                shipping: shipping,
                total: total,
                item_count: items.length,
                total_items: cart.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
},

    updateCartItem: async (req, res) => {
        try {
            const { item_id } = req.params;
            const { quantity } = req.body;
            const user_id = req.body.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login first'
                });
            }

            const cartItem = await CartItem.findByPk(item_id, {
                include: [
                    { model: Cart, as: 'cart' },
                    { 
                        model: ProductVariation, 
                        as: 'variation',
                        include: [{ model: Product, as: 'product' }]
                    },
                    { model: Product, as: 'product' }
                ]
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart item not found'
                });
            }

            if (cartItem.cart.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            // Check stock
            const stock = cartItem.variation ? cartItem.variation.stock : cartItem.product?.stock;
            if (stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available`
                });
            }

            if (quantity <= 0) {
                await cartItem.destroy();
                await updateCartTotals(cartItem.cart_id);
                return res.json({
                    success: true,
                    message: 'Item removed from cart'
                });
            }

            const itemPrice = cartItem.variation ? cartItem.variation.price : cartItem.price;
            await cartItem.update({
                quantity: quantity,
                total: itemPrice * quantity
            });

            await updateCartTotals(cartItem.cart_id);

            res.json({
                success: true,
                message: 'Cart updated successfully',
                cartItem: {
                    id: cartItem.id,
                    quantity: cartItem.quantity,
                    total: cartItem.total
                }
            });

        } catch (error) {
            console.error('Update cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const { item_id } = req.params;
            const user_id = req.body.user_id;

            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login first'
                });
            }

            const cartItem = await CartItem.findByPk(item_id, {
                include: [{ model: Cart, as: 'cart' }]
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart item not found'
                });
            }

            if (cartItem.cart.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            const cartId = cartItem.cart_id;
            await cartItem.destroy();
            await updateCartTotals(cartId);

            res.json({
                success: true,
                message: 'Item removed from cart'
            });

        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    clearCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({
                where: { user_id: req.query.user_id }
            });

            if (cart) {
                await CartItem.destroy({
                    where: { cart_id: cart.id }
                });
                await updateCartTotals(cart.id);
            }

            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });

        } catch (error) {
            console.error('Clear cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    getCartCount: async (req, res) => {
        try {
            const cart = await Cart.findOne({
                where: { user_id: req.query.user_id },
                include: [{ model: CartItem, as: 'items' }]
            });

            const count = cart && cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

            res.json({
                success: true,
                count: count
            });

        } catch (error) {
            console.error('Get cart count error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    getCartSummary: async (req, res) => {
        try {
            const cart = await Cart.findOne({
                where: { user_id: req.query.user_id },
                include: [{
                    model: CartItem,
                    as: 'items',
                    include: [
                        { 
                            model: Product, 
                            as: 'product',
                            attributes: ['id', 'name', 'stock']
                        },
                        {
                            model: ProductVariation,
                            as: 'variation'
                        }
                    ]
                }]
            });

            if (!cart || !cart.items || cart.items.length === 0) {
                return res.json({
                    success: true,
                    summary: {
                        subtotal: 0,
                        tax: 0,
                        shipping: 0,
                        total: 0,
                        item_count: 0,
                        items: []
                    }
                });
            }

            let subtotal = 0;
            const items = cart.items.map(item => {
                const itemPrice = item.variation ? parseFloat(item.variation.price) : parseFloat(item.price);
                const itemTotal = itemPrice * item.quantity;
                subtotal += itemTotal;
                return {
                    id: item.id,
                    product_id: item.product_id,
                    variation_id: item.variation_id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: itemPrice,
                    total: itemTotal
                };
            });

            const tax = subtotal * 0.05;
            const shipping = subtotal > 500 ? 0 : 40;
            const total = subtotal + tax + shipping;

            res.json({
                success: true,
                summary: {
                    subtotal: subtotal,
                    tax: tax,
                    shipping: shipping,
                    total: total,
                    item_count: cart.items.length,
                    items: items
                }
            });

        } catch (error) {
            console.error('Get cart summary error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // ==================== ORDERS WITH VARIATIONS ====================

  createCheckoutOrder: async (req, res) => {
    try {
        const { 
            shippingDetails, 
            items, 
            total, 
            paymentMethod 
        } = req.body;
        
        const user_id = req.body.user_id || req.query.user_id;
        
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const orderNumber = 'ORD' + Date.now();
        const shipping_charge = total > 500 ? 0 : 40;
        const finalTotal = total + shipping_charge;

        const order = await Order.create({
            user_id: user_id,
            order_number: orderNumber,
            subtotal: total,
            shipping_charge: shipping_charge,
            total: finalTotal,
            payment_method: paymentMethod || 'cod',
            order_status: 'pending',
            payment_status: 'pending',
            shipping_name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
            shipping_email: shippingDetails.email,
            shipping_address: shippingDetails.address,
            shipping_city: shippingDetails.city,
            shipping_state: shippingDetails.state,
            shipping_pincode: shippingDetails.pincode,
            shipping_phone: shippingDetails.phone
        });

        for (const item of items) {
            let product, variation, price, cgst_rate, sgst_rate, igst_rate, variationName = null;
            let productSku = null;
            
            if (item.variation_id) {
                variation = await ProductVariation.findByPk(item.variation_id);
                product = await Product.findByPk(item.id);
                price = variation.price;
                cgst_rate = parseFloat(variation.cgst_rate) || 0;
                sgst_rate = parseFloat(variation.sgst_rate) || 0;
                igst_rate = parseFloat(variation.igst_rate) || 0;
                productSku = variation.sku || product.sku;
                
                // Get variation attributes for name
                const variationAttributes = await ProductVariationAttribute.findAll({
                    where: { variation_id: item.variation_id },
                    include: [{ model: AttributeValue, as: 'attribute_value' }]
                });
                variationName = variationAttributes.map(va => va.attribute_value.value).join(', ');
                
                await variation.update({ 
                    stock: variation.stock - item.quantity 
                });
            } else {
                product = await Product.findByPk(item.id);
                price = item.price;
                cgst_rate = parseFloat(product.cgst_rate) || 0;
                sgst_rate = parseFloat(product.sgst_rate) || 0;
                igst_rate = parseFloat(product.igst_rate) || 0;
                productSku = product.sku;
                
                await product.update({ 
                    stock: product.stock - item.quantity,
                    sold_count: (product.sold_count || 0) + item.quantity
                });
            }
            
            // Calculate GST amounts
            const itemTotal = parseFloat(price) * item.quantity;
            const cgstAmount = (itemTotal * cgst_rate) / 100;
            const sgstAmount = (itemTotal * sgst_rate) / 100;
            const igstAmount = (itemTotal * igst_rate) / 100;
            
            await OrderItem.create({
                order_id: order.id,
                product_id: item.id,
                variation_id: item.variation_id || null,
                product_name: item.name,
                variation_name: variationName,
                product_image: item.image || (product && product.images && product.images[0]) || null,
                product_sku: productSku,
                quantity: item.quantity,
                price: parseFloat(price),
                total: itemTotal,
                cgst_amount: cgstAmount,
                sgst_amount: sgstAmount,
                igst_amount: igstAmount
            });
        }

        const cart = await Cart.findOne({ where: { user_id: user_id } });
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.id } });
            await updateCartTotals(cart.id);
        }

        res.json({
            success: true,
            message: 'Order placed successfully',
            order: {
                id: order.id,
                order_number: order.order_number,
                total: order.total,
                status: order.order_status
            }
        });

    } catch (error) {
        console.error('Create checkout order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
},

getMyOrders: async (req, res) => {
    try {
        const user_id = req.query.user_id;
        
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }

        const orders = await Order.findAll({
            where: { user_id: user_id },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [
                    { 
                        model: Product, 
                        as: 'product',
                        attributes: ['id', 'name', 'images', 'price', 'cgst_rate', 'sgst_rate', 'igst_rate']
                    },
                    { 
                        model: ProductVariation, 
                        as: 'variation',
                        attributes: ['id', 'sku', 'price', 'cgst_rate', 'sgst_rate', 'igst_rate','images']
                    }
                ]
            }],
            order: [['created_at', 'DESC']]
        });

        // Format orders for frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            subtotal: parseFloat(order.subtotal),
            shipping_charge: parseFloat(order.shipping_charge),
            total: parseFloat(order.total),
            payment_method: order.payment_method,
            order_status: order.order_status,
            shipping_name: order.shipping_name,
            shipping_address: order.shipping_address,
            shipping_city: order.shipping_city,
            shipping_state: order.shipping_state,
            shipping_pincode: order.shipping_pincode,
            shipping_phone: order.shipping_phone,
            shipping_email: order.shipping_email,
            items: order.items.map(item => {
                // Calculate GST if not already stored
                let cgstAmount = parseFloat(item.cgst_amount) || 0;
                let sgstAmount = parseFloat(item.sgst_amount) || 0;
                let igstAmount = parseFloat(item.igst_amount) || 0;
                let variationName = item.variation_name;
                 let variationImage = null;
                let productImage = null;
                  if (item.variation && item.variation.images && item.variation.images.length > 0) {
                    variationImage = item.variation.images[0];
                }
                
                // Get product image
                if (item.product && item.product.images && item.product.images.length > 0) {
                    productImage = item.product.images[0];
                }
                // If GST not calculated, calculate now
                if (cgstAmount === 0 && sgstAmount === 0 && igstAmount === 0) {
                    const itemTotal = parseFloat(item.total);
                    let cgstRate = 0, sgstRate = 0, igstRate = 0;
                    
                    if (item.variation) {
                        cgstRate = parseFloat(item.variation.cgst_rate) || 0;
                        sgstRate = parseFloat(item.variation.sgst_rate) || 0;
                        igstRate = parseFloat(item.variation.igst_rate) || 0;
                    } else if (item.product) {
                        cgstRate = parseFloat(item.product.cgst_rate) || 0;
                        sgstRate = parseFloat(item.product.sgst_rate) || 0;
                        igstRate = parseFloat(item.product.igst_rate) || 0;
                    }
                    
                    cgstAmount = (itemTotal * cgstRate) / 100;
                    sgstAmount = (itemTotal * sgstRate) / 100;
                    igstAmount = (itemTotal * igstRate) / 100;
                }
                
                // Get variation name if not stored
                if (!variationName && item.variation_id) {
                    // You can fetch variation attributes here if needed
                    variationName = item.variation?.sku || 'Variant';
                }
                console.log('item',item);
                
                
                return {
                    id: item.id,
                    product_id: item.product_id,
                    variation_id: item.variation_id,
                    product_name: item.product_name || item.product?.name,
                    variation_name: variationName,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    total: parseFloat(item.total),
                    product_image: item.product_image || productImage,
                    variation_image: variationImage,
                    cgst_amount: cgstAmount,
                    sgst_amount: sgstAmount,
                    igst_amount: igstAmount,
                  
                };
            })
        }));

        res.json({
            success: true,
            orders: formattedOrders
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
},

    getOrderDetails: async (req, res) => {
        try {
            const user_id = req.query.user_id;
            
            if (!user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login first'
                });
            }

            const order = await Order.findOne({
                where: { id: req.params.id, user_id: user_id },
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: ProductVariation, as: 'variation' }
                    ]
                }]
            });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            res.json({ success: true, order });

        } catch (error) {
            console.error('Get order details error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
    ,
    firebaseLogin: async (req, res) => {
  try {
    const { mobile } = req.body;

    let user = await User.findOne({
      where: { mobile }
    });

    // New User
    if (!user) {
     user = await User.create({
  name: 'User',
  email: `${mobile}@hogaa.temp`,
  mobile,
  password: crypto.randomBytes(16).toString('hex'),
  status: 'active',
  mobile_verified: true
});
    }

    await user.update({
      last_login: new Date()
    });

    req.session.user = {
      id: user.id,
      mobile: user.mobile,
      role: "user"
    };

    return res.json({
      success: true,
      user: user.getPublicData()
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
};

module.exports = userController;
