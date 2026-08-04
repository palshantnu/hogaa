import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import "./Launch.css";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";
import { useAuth } from "../context/AuthContext";

import newLaunchBanner from "../assets/photo/11.jpeg";
import bestsellerBanner from "../assets/photo/12.jpeg";
import eliteBanner from "../assets/photo/13.jpeg";

const NewLaunches = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Visibility states for each section (showing 8 products = 2 rows of 4)
  const [visibleCounts, setVisibleCounts] = useState({
    newLaunches: 8,
    bestsellers: 8,
    eliteEdition: 8
  });
  
  const [loadMoreLoading, setLoadMoreLoading] = useState({
    newLaunches: false,
    bestsellers: false,
    eliteEdition: false
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://admin.hogaacosmetics.com/api/products?show_variations=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setAllProducts(data.products);
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
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Helper function to get image URL
  const getImageUrl = (product) => {
    console.log('product', product);
    
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
if (!product.is_variation || !product.variation_id) {
   return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
}
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${imagePath}`;
  };

  // Helper function to get display price
  const getDisplayPrice = (product) => {
    if (product.price) {
      return `₹${parseFloat(product.price).toLocaleString('en-IN')}`;
    }
    if (product.price_range && product.price_range.display) {
      return product.price_range.display;
    }
    return `₹0`;
  };

  // Helper function to get discount percentage
  const getDiscountPercentage = (product) => {
    const price = parseFloat(product.price);
    const comparePrice = product.compare_price ? parseFloat(product.compare_price) : null;

    if (comparePrice && comparePrice > price) {
      return Math.round(((comparePrice - price) / comparePrice) * 100);
    }
    return product.discount_percentage || 0;
  };

  // Helper function to get stock status
  const getStockStatus = (product) => {
    const stock = product.stock || 0;
    if (stock > 10) return { text: 'In Stock', class: 'in-stock', available: true };
    if (stock > 0) return { text: `Only ${stock} left`, class: 'low-stock', available: true };
    return { text: 'Out of Stock', class: 'out-stock', available: false };
  };

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const stockStatus = getStockStatus(product);
    if (!stockStatus.available) {
      setToastMessage('Out of stock!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setAddingToCart(product.id);

    try {
      const productToAdd = {
        id: product.parent_id || product.id,
        name: product.name,
        price: product.price,
        images: product.images
      };

      if (product.is_variation || product.variation_id) {
        productToAdd.variation_id = product.variation_id;
      }
      
      const result = await addToCart(productToAdd, 1, user);

      if (result.success) {
        setToastMessage(result.message || 'Product added to cart successfully!');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage(result.message || 'Failed to add to cart');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      setToastMessage(error.message || 'Failed to add to cart. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingToCart(null);
    }
  };

  // Navigate to product detail
  const handleProductClick = (product) => {
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  // Load more products for specific section
  const handleLoadMore = (section) => {
    setLoadMoreLoading(prev => ({ ...prev, [section]: true }));
    setTimeout(() => {
      setVisibleCounts(prev => ({ ...prev, [section]: prev[section] + 8 }));
      setLoadMoreLoading(prev => ({ ...prev, [section]: false }));
    }, 500);
  };

  // Filter products by tag
  const getProductsByTag = (tag) => {
    return allProducts.filter(product => 
      product.tags && product.tags.includes(tag)
    );
  };

  // Get products for each section
  const newLaunchesProducts = getProductsByTag('new-launch');
  const bestsellersProducts = getProductsByTag('bestseller');
  const eliteEditionProducts = getProductsByTag('elite');

  // If no products with specific tags, use all products as fallback
  const finalNewLaunches = newLaunchesProducts.length > 0 ? newLaunchesProducts : allProducts.slice(0, 16);
  const finalBestsellers = bestsellersProducts.length > 0 ? bestsellersProducts : allProducts.slice(0, 16);
  const finalEliteEdition = eliteEditionProducts.length > 0 ? eliteEditionProducts : allProducts.slice(0, 16);

  // Render product grid component
  const renderProductGrid = (products, title, section, productCount, bannerImg) => {
    const visibleProducts = products.slice(0, visibleCounts[section]);
    const hasMore = visibleCounts[section] < products.length;

    if (products.length === 0) return null;

    return (
      <div className="products-section">
        {/* {bannerImg && (
          <div className="section-banner">
            <img src={bannerImg} alt={title} loading="lazy" />
          </div>
        )} */}
        <div className="products-header">
          <h2>{title}</h2>
          <p className="products-count">{productCount || products.length} products available</p>
        </div>

        <div className="products-grid">
          {visibleProducts.map((product) => {
            const discount = getDiscountPercentage(product);
            const displayPrice = getDisplayPrice(product);
            const stockStatus = getStockStatus(product);

            return (
              <div
                className="product-card"
                key={product.variation_id ? `${product.id}-${product.variation_id}` : product.id}
                onClick={() => handleProductClick(product)}
              >
                {discount > 0 && (
                  <div className="discount-badge">{discount}% OFF</div>
                )}
                
                <div className="product-image-wrapper">
                  {/* <img
                    src={'https://www.sugarcosmetics.com/cdn/shop/files/Charm-showcase-select-any-1.jpg?v=1776861899&width=800'}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  /> */}
                    <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                
                <div className="product-info2">
                  <h4 className="product-title">{product.name}</h4>
                  <p className="product-description">
                    {product.short_description || 'Premium quality product'}
                  </p>

                  {product.attributes && Object.keys(product.attributes).length > 0 && (
                    <div className="product-attributes">
                      {Object.values(product.attributes).slice(0, 2).map((attr, idx) => (
                        <span key={idx} className="attribute-badge">
                          {attr.value}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="product-price">
                    <span className="current-price">{displayPrice}</span>
                    {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                      <>
                        <span className="old-price">₹{parseFloat(product.compare_price).toLocaleString('en-IN')}</span>
                        <span className="discount-percent">{discount}% off</span>
                      </>
                    )}
                  </div>

                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!stockStatus.available || addingToCart === product.id}
                  >
                    {addingToCart === product.id ? 'Adding...' : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button 
              className="load-more-btn" 
              onClick={() => handleLoadMore(section)}
              disabled={loadMoreLoading[section]}
            >
              {loadMoreLoading[section] ? 'Loading...' : `Load More (${visibleCounts[section]}/${products.length})`}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="products-container">
        <div className="loading-products">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="products-container">
        <div className="error-products">
          <p>Error loading products: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Toast Notification */}
      {showToast && (
        <div className={`cart-toast ${toastType}`}>
          {toastMessage}
        </div>
      )}

      {/* New Launches Section */}
      {renderProductGrid(finalNewLaunches, 'NEW LAUNCHES', 'newLaunches', finalNewLaunches.length, newLaunchBanner)}

      {/* Bestsellers Section */}
      {renderProductGrid(finalBestsellers, 'BEST SELLERS', 'bestsellers', finalBestsellers.length, bestsellerBanner)}

      {/* Elite Edition Section */}
      {renderProductGrid(finalEliteEdition, 'ELITE EDITION', 'eliteEdition', finalEliteEdition.length, eliteBanner)}
    </div>
  );
};

export default NewLaunches;