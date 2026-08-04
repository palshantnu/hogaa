import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { addToCart } from "../utils/cart";
import ScrollReveal from "scrollreveal";
import "./CategoryProductPage.css";


const CategoryProductPage = () => {
    const navigate = useNavigate();
    const { categorySlug } = useParams();
    const location = useLocation();
    
    const [allProducts, setAllProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSortOpen, setSortOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [openSection, setOpenSection] = useState("price");
    const [sortBy, setSortBy] = useState("newest");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [addingToCart, setAddingToCart] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const categoryGradients = {
        lips: "linear-gradient(135deg, #c9184a 0%, #ff4d6d 40%, #ffb3c1 100%)",
        eyes: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        face: "linear-gradient(135deg, #f4a261 0%, #e76f51 40%, #e9c46a 100%)",
        skin: "linear-gradient(135deg, #b5838d 0%, #e5989b 40%, #ffcdb2 100%)",
        gifting: "linear-gradient(135deg, #7b2d8b 0%, #c9a96e 40%, #f4e2d8 100%)",
        nails: "linear-gradient(135deg, #e63946 0%, #f72585 40%, #b5179e 100%)",
        "lip-balm": "linear-gradient(135deg, #c9184a 0%, #ff4d6d 40%, #ffb3c1 100%)",
        lipbalm: "linear-gradient(135deg, #c9184a 0%, #ff4d6d 40%, #ffb3c1 100%)",
    };

    const categoryIcons = {
        lips: "💄",
        eyes: "👁️",
        face: "✨",
        skin: "🌿",
        gifting: "🎁",
        nails: "💅",
        "lip-balm": "💋",
        lipbalm: "💋",
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    const getCategorySlug = () => {
        if (categorySlug) return categorySlug;
        if (location.state?.categoryslug) return location.state.categoryslug;
        return 'lips';
    };

    const currentCategorySlug = getCategorySlug();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = `https://admin.hogaacosmetics.com/api/products/category/${currentCategorySlug}`;
                if (sortBy !== 'newest') {
                    url += `?sort=${sortBy}`;
                }

                const response = await fetch(url, { credentials: 'include' });
                const data = await response.json();

                if (data.success) {
                    setAllProducts(data.products || []);
                    setCategory(data.category);
                } else {
                    setError(data.message || 'Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentCategorySlug, sortBy]);

    const getProductPrice = (product) => {
        if (product.has_variations && product.variations?.length > 0) {
            return Math.min(...product.variations.map(v => parseFloat(v.price) || 0));
        }
        return parseFloat(product.price) || 0;
    };

    const products = allProducts.filter((product) => {
        const price = getProductPrice(product);
        const min = priceRange.min !== "" ? parseFloat(priceRange.min) : null;
        const max = priceRange.max !== "" ? parseFloat(priceRange.max) : null;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                product.name?.toLowerCase().includes(q) ||
                product.short_description?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    useEffect(() => {
        if (products.length > 0) {
            ScrollReveal().reveal(".product-grid-item", {
                distance: "40px",
                origin: "bottom",
                duration: 800,
                interval: 100,
                reset: false,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)"
            });
        }
    }, [products]);

    const handleSort = (sortType) => {
        setSortBy(sortType);
        setSortOpen(false);
    };

    const handlePriceFilter = (min, max, label) => {
        setPriceRange({ min: min !== null ? min : "", max: max !== null ? max : "" });
        setActiveFilter(label || "all");
        if (isFilterOpen) setFilterOpen(false);
    };

    const getImageUrl = (product) => {
        if (!product.images || product.images.length === 0) {
            return 'https://via.placeholder.com/300x300?text=No+Image';
        }
        const imagePath = product.images[0];
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('/uploads/')) {
            return `https://admin.hogaacosmetics.com${imagePath}`;
        }
        return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
    };

    const getDisplayPrice = (product) => {
        if (product.display_price) {
            return product.display_price;
        }
        if (product.price_range && product.price_range.display) {
            return product.price_range.display;
        }
        if (product.price) {
            return `₹${parseFloat(product.price).toLocaleString('en-IN')}`;
        }
        return '₹0';
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        
        let isInStock = false;
        let stockStatus = product.stock || 0;
        
        if (product.has_variations && product.variations && product.variations.length > 0) {
            stockStatus = product.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
            isInStock = stockStatus > 0;
        } else {
            isInStock = product.stock > 0;
        }
        
        if (!isInStock) {
            showToast("Out of stock!", "error");
            return;
        }
        
        setAddingToCart(product.id);
        
        try {
            let productToAdd = {
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images
            };
            
            if (product.has_variations && product.variations && product.variations.length > 0) {
                const firstVariation = product.variations[0];
                productToAdd.variation_id = firstVariation.id;
                productToAdd.price = parseFloat(firstVariation.price);
            }
            
            const result = await addToCart(productToAdd, 1, user);
            
            if (result.success) {
                showToast(`${product.name} added to cart!`, "success");
            } else {
                showToast(result.message || "Failed to add to cart", "error");
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            showToast('Failed to add to cart', "error");
        } finally {
            setAddingToCart(null);
        }
    };

    const handleProductClick = (product) => {
        if (product.slug) {
            navigate(`/product/${product.slug}`);
        } else {
            navigate(`/product/${product.id}`);
        }
    };

    if (loading) {
        return (
            <div className="category-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Discovering beautiful products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="category-page">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    const bannerGradient = categoryGradients[currentCategorySlug?.toLowerCase()] || "linear-gradient(135deg, #2d2d2d 0%, #4a4a4a 100%)";
    const bannerIcon = categoryIcons[currentCategorySlug?.toLowerCase()] || "✨";
    const categoryName = category?.name || currentCategorySlug;

    return (
        <div className="category-page">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-content">
                        <span className="toast-icon">
                            {toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}
                        </span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Hero Banner */}
            {/* <div className="category-hero-banner" style={{ background: bannerGradient }}>
                <div className="hero-text-content">
                    <div className="hero-category-icon">{bannerIcon}</div>
                    <div className="hero-badge">{categoryName} Collection</div>
                    <h1 className="hero-title">{categoryName}</h1>
                    <p className="hero-subtitle">Discover the finest {categoryName} products crafted for perfection</p>
                    <button className="hero-cta" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                        Explore Collection
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                <div className="hero-decorative-circle hero-circle-1"></div>
                <div className="hero-decorative-circle hero-circle-2"></div>
                <div className="hero-decorative-circle hero-circle-3"></div>
            </div> */}

            {/* Mobile Action Bar */}
            <div className="mobile-action-bar">
                <div className="mobile-search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        className="mobile-search-input"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
                    )}
                </div>
                <div className="mobile-actions-row">
                    <button className="action-btn" onClick={() => setFilterOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16v2L14 12v6l-4 2v-8L4 6V4z"/>
                        </svg>
                        Filter {activeFilter !== "all" && <span className="filter-dot"></span>}
                    </button>
                    <button className="action-btn" onClick={() => setSortOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M6 12h12M10 18h4"/>
                        </svg>
                        Sort
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="category-main-layout">
                {/* Sidebar Filters */}
                <aside className="filter-sidebar">
                    <div className="filter-header">
                        <h3>Filters</h3>
                        {activeFilter !== "all" && (
                            <button className="clear-filters" onClick={() => handlePriceFilter(null, null, "all")}>
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <div 
                            className={`filter-group-header ${openSection === "price" ? "active" : ""}`}
                            onClick={() => setOpenSection(openSection === "price" ? null : "price")}
                        >
                            <span>Price Range</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                        {openSection === "price" && (
                            <div className="filter-group-content">
                                <div 
                                    className={`filter-option ${activeFilter === "under499" ? "active" : ""}`}
                                    onClick={() => handlePriceFilter(0, 499, "under499")}
                                >
                                    <span>Under ₹499</span>
                                    <span className="count">(Budget Friendly)</span>
                                </div>
                                <div 
                                    className={`filter-option ${activeFilter === "500-999" ? "active" : ""}`}
                                    onClick={() => handlePriceFilter(500, 999, "500-999")}
                                >
                                    <span>₹500 - ₹999</span>
                                    <span className="count">(Value Picks)</span>
                                </div>
                                <div 
                                    className={`filter-option ${activeFilter === "1000-1499" ? "active" : ""}`}
                                    onClick={() => handlePriceFilter(1000, 1499, "1000-1499")}
                                >
                                    <span>₹1000 - ₹1499</span>
                                    <span className="count">(Premium)</span>
                                </div>
                                <div 
                                    className={`filter-option ${activeFilter === "above1500" ? "active" : ""}`}
                                    onClick={() => handlePriceFilter(1500, null, "above1500")}
                                >
                                    <span>Above ₹1500</span>
                                    <span className="count">(Luxury)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="filter-stats">
                        <p>{products.length} of {allProducts.length} products</p>
                    </div>
                </aside>

                {/* Products Section */}
                <main className="products-main">
                    <div className="products-header-bar">
                        <div className="results-count">
                            <span className="count-number">{products.length}</span>
                            <span className="count-text">Products Available</span>
                        </div>
                        <div className="search-bar-wrapper">
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder={`Search in ${categoryName}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
                            )}
                        </div>
                        <div className="sort-desktop" onClick={() => setSortOpen(true)}>
                            <span>Sort by: </span>
                            <strong>
                                {sortBy === "newest" ? "Newest First" :
                                 sortBy === "price_low" ? "Price: Low to High" :
                                 sortBy === "price_high" ? "Price: High to Low" :
                                 sortBy === "popular" ? "Popular" : "Newest First"}
                            </strong>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                    </div>

                    <div className="products-grid">
                        {products.map((product, index) => {
                            const discount = product.discount_percentage || 0;
                            const displayPrice = getDisplayPrice(product);
                            
                            let stockStatus = product.stock || 0;
                            let stockText = "";
                            let stockClass = "";
                            
                            if (product.has_variations && product.variations && product.variations.length > 0) {
                                stockStatus = product.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
                                if (stockStatus > 10) {
                                    stockText = "In Stock";
                                    stockClass = "in-stock";
                                } else if (stockStatus > 0) {
                                    stockText = `Only ${stockStatus} left`;
                                    stockClass = "low-stock";
                                } else {
                                    stockText = "Out of Stock";
                                    stockClass = "out-stock";
                                }
                            } else {
                                if (product.stock > 10) {
                                    stockText = "In Stock";
                                    stockClass = "in-stock";
                                } else if (product.stock > 0) {
                                    stockText = `Only ${product.stock} left`;
                                    stockClass = "low-stock";
                                } else {
                                    stockText = "Out of Stock";
                                    stockClass = "out-stock";
                                }
                            }

                            return (
                                <div 
                                    key={product.id} 
                                    className="product-grid-item"
                                    onClick={() => handleProductClick(product)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="product-card">
                                        <div className="product-image-area">
                                            {discount > 0 && (
                                                <div className="discount-tag">{discount}% OFF</div>
                                            )}
                                            <img
                                                src={getImageUrl(product)}
                                                alt={product.name}
                                                className="product-image"
                                                loading="lazy"
                                            />
                                            {/* <button 
                                                className="quick-add-btn"
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={stockStatus === 0 || addingToCart === product.id}
                                            >
                                                {addingToCart === product.id ? 'Adding...' : 'Quick Add'}
                                            </button> */}
                                        </div>
                                        <div className="product-details">
                                            <h3 className="product-title">{product.name}</h3>
                                            <p className="product-description">{product.short_description || 'Premium quality product'}</p>
                                            
                                            {product.has_variations && product.variations && product.variations.length > 0 && (
                                                <div className="variant-badge">
                                                    <span>{product.variations.length} Variants Available</span>
                                                </div>
                                            )}

                                            <div className="price-section">
                                                <span className="current-price">{displayPrice}</span>
                                                {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                                                    <>
                                                        <span className="original-price">₹{parseFloat(product.compare_price).toLocaleString('en-IN')}</span>
                                                        <span className="save-price">Save {discount}%</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className={`stock-indicator ${stockClass}`}>
                                                <span className="stock-dot"></span>
                                                <span>{stockText}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {products.length === 0 && !loading && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>{searchQuery ? `No results for "${searchQuery}"` : "No products found"}</h3>
                            <p>Try adjusting your search or filters</p>
                            <button onClick={() => { handlePriceFilter(null, null, "all"); setSearchQuery(""); }}>
                                Clear All
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Sort Bottom Sheet */}
            {isSortOpen && (
                <div className="modal-overlay" onClick={() => setSortOpen(false)}>
                    <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="sheet-header">
                            <h3>Sort By</h3>
                            <button className="close-sheet" onClick={() => setSortOpen(false)}>✕</button>
                        </div>
                        <div className="sheet-content">
                            <div 
                                className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                                onClick={() => handleSort('newest')}
                            >
                                <span>Newest First</span>
                                {sortBy === 'newest' && <span className="check">✓</span>}
                            </div>
                            <div 
                                className={`sort-option ${sortBy === 'price_low' ? 'active' : ''}`}
                                onClick={() => handleSort('price_low')}
                            >
                                <span>Price: Low to High</span>
                                {sortBy === 'price_low' && <span className="check">✓</span>}
                            </div>
                            <div 
                                className={`sort-option ${sortBy === 'price_high' ? 'active' : ''}`}
                                onClick={() => handleSort('price_high')}
                            >
                                <span>Price: High to Low</span>
                                {sortBy === 'price_high' && <span className="check">✓</span>}
                            </div>
                            <div 
                                className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                                onClick={() => handleSort('popular')}
                            >
                                <span>Most Popular</span>
                                {sortBy === 'popular' && <span className="check">✓</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bottom Sheet */}
            {isFilterOpen && (
                <div className="modal-overlay" onClick={() => setFilterOpen(false)}>
                    <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="sheet-header">
                            <h3>Filter by Price</h3>
                            <button className="close-sheet" onClick={() => setFilterOpen(false)}>✕</button>
                        </div>
                        <div className="sheet-content">
                            <div 
                                className={`filter-sheet-option ${activeFilter === "under499" ? 'active' : ''}`}
                                onClick={() => handlePriceFilter(0, 499, "under499")}
                            >
                                <span>Under ₹499</span>
                            </div>
                            <div 
                                className={`filter-sheet-option ${activeFilter === "500-999" ? 'active' : ''}`}
                                onClick={() => handlePriceFilter(500, 999, "500-999")}
                            >
                                <span>₹500 - ₹999</span>
                            </div>
                            <div 
                                className={`filter-sheet-option ${activeFilter === "1000-1499" ? 'active' : ''}`}
                                onClick={() => handlePriceFilter(1000, 1499, "1000-1499")}
                            >
                                <span>₹1000 - ₹1499</span>
                            </div>
                            <div 
                                className={`filter-sheet-option ${activeFilter === "above1500" ? 'active' : ''}`}
                                onClick={() => handlePriceFilter(1500, null, "above1500")}
                            >
                                <span>Above ₹1500</span>
                            </div>
                            <div 
                                className={`filter-sheet-option ${activeFilter === "all" ? 'active' : ''}`}
                                onClick={() => handlePriceFilter(null, null, "all")}
                            >
                                <span>All Prices</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryProductPage;