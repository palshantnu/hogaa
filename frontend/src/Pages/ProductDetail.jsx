import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { addToCart, updateCartItem, removeFromCart, getCart } from "../utils/cart";
import { useAuth } from "../context/AuthContext";
import { 
  Truck, Clock, RefreshCw, Shield,
  CheckCircle, AlertCircle, Minus, Plus, Trash2, ShoppingBag,
  Share2, ChevronLeft, ChevronRight, Zap, Copy, Check, PlayCircle
} from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [qty, setQty] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef(null);
  const thumbnailRef = useRef(null);
  const videoRefs = useRef({});

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [variations, setVariations] = useState([]);
  const [isOnlineSidebarOpen, setIsOnlineSidebarOpen] = useState(false);

  // Get current product URL
  const getCurrentUrl = () => {
    return window.location.href;
  };

  // Share functions
  const shareOnWhatsApp = () => {
    const url = getCurrentUrl();
    const text = `Check out ${product?.name} on hogaa Cosmetics!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const url = getCurrentUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setToastMessage("Link copied to clipboard!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShowShareMenu(false), 1500);
    } catch {
      setToastMessage("Failed to copy link");
      setToastType("error");
      setShowToast(true);
    }
  };

  const checkCartStatus = useCallback(async () => {
    try { 
      const cartItems = await getCart(user);
      const existingItem = cartItems.find(item => {
        if (selectedVariation) {
          return item.product_id === product?.id && item.variation_id === selectedVariation.variation_id;
        }
        return item.product_id === product?.id && !item.variation_id;
      });

      if (existingItem) {
        setIsInCart(true);
        setCartItemId(existingItem.cartItemId);
        setCartQuantity(existingItem.quantity);
      } else {
        setIsInCart(false);
        setCartItemId(null);
        setCartQuantity(0);
      }
    } catch (error) {
      console.error("Error checking cart:", error);
    }
  }, [product?.id, selectedVariation, user]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://admin.hogaacosmetics.com/api/products/${slug}`, {
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
          setProduct(data.product);
          setRelatedProducts(data.related_products || []);
          
          if (data.product.variations && data.product.variations.length > 0) {
            setVariations(data.product.variations);
            setAvailableAttributes(data.product.available_attributes || []);
            
            if (data.product.selected_variation) {
              setSelectedVariation(data.product.selected_variation);
              const attrs = {};
              Object.values(data.product.selected_variation.attributes || {}).forEach(attr => {
                attrs[attr.attribute_id] = attr.value_id;
              });
              setSelectedAttributes(attrs);
              setMainImage(getImageUrl(data.product.selected_variation.images?.[0] || data.product.images?.[0], true));
            } else if (data.product.variations[0]) {
              setSelectedVariation(data.product.variations[0]);
              setMainImage(getImageUrl(data.product.images?.[0]));
            }
          } else {
            setMainImage(getImageUrl(data.product.images?.[0]));
          }
        } else {
          setError(data.message || 'Failed to load product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  useEffect(() => {
    if (product && user) {
      checkCartStatus();
    }
  }, [product, user, selectedVariation, checkCartStatus]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const getImageUrl = (imagePath, isVariation = false) => {
    if (!imagePath) return 'https://via.placeholder.com/500x500?text=Product+Image';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return `https://admin.hogaacosmetics.com${imagePath}`;
    }
    if (!isVariation) {
      return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
    }
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${imagePath}`;
  };

  const getVideoUrl = (videoPath, isVariation = false) => {
    if (!videoPath) return null;
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath;
    }
    if (videoPath.startsWith('/uploads/')) {
      return `https://admin.hogaacosmetics.com${videoPath}`;
    }
    if (!isVariation) {
      return `https://admin.hogaacosmetics.com/uploads/products/${videoPath}`;
    }
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${videoPath}`;
  };

  const handleAttributeSelect = async (attributeId, valueId) => {
    const newAttributes = { ...selectedAttributes, [attributeId]: valueId };
    setSelectedAttributes(newAttributes);
    
    const matchingVariation = variations.find(variation => {
      let match = true;
      for (const [attrId, valId] of Object.entries(newAttributes)) {
        const variationAttr = Object.values(variation.attributes || {}).find(
          attr => attr.attribute_id === parseInt(attrId)
        );
        if (!variationAttr || variationAttr.value_id !== parseInt(valId)) {
          match = false;
          break;
        }
      }
      return match;
    });
    
    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      if (matchingVariation.images && matchingVariation.images.length > 0) {
        setMainImage(getImageUrl(matchingVariation.images[0], true));
        setActiveImageIndex(0);
      }
      setQty(1);
      
      if (matchingVariation.variation_slug) {
        navigate(`/product/${matchingVariation.variation_slug}`, { replace: true });
      }
    }
  };

  const getCurrentStock = () => {
    if (product?.has_variations && selectedVariation) {
      return selectedVariation.stock || 0;
    }
    return product?.stock || 0;
  };

  const getCurrentPrice = () => {
    if (product?.has_variations && selectedVariation) {
      return selectedVariation.price;
    }
    return product?.price || 0;
  };

  const getCurrentComparePrice = () => {
    if (product?.has_variations && selectedVariation) {
      return selectedVariation.compare_price;
    }
    return product?.compare_price;
  };

  const getCurrentDiscount = () => {
    const price = getCurrentPrice();
    const comparePrice = getCurrentComparePrice();
    if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
      return Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100);
    }
    return 0;
  };

  const formatRelatedPrice = (price) => {
    const numericPrice = parseFloat(price);

    if (Number.isNaN(numericPrice)) {
      return price || "View price";
    }

    return `₹${numericPrice.toLocaleString('en-IN')}`;
  };

  const syncVideoPlayback = (activeIndex, mediaItems = []) => {
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (!el) return;
      if (Number(idx) === activeIndex && mediaItems[activeIndex]?.type === "video") {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  };

  const scrollToImage = (index, mediaItems = []) => {
    if (!mediaItems.length) return;

    const normalizedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
    const selectedMedia = mediaItems[normalizedIndex];
    setActiveImageIndex(normalizedIndex);
    if (selectedMedia?.type === "image") {
      setMainImage(selectedMedia.url);
    }

    syncVideoPlayback(normalizedIndex, mediaItems);

    const imageContainer = scrollRef.current;
    if (imageContainer) {
      imageContainer.scrollTo({
        left: normalizedIndex * imageContainer.offsetWidth,
        behavior: "smooth"
      });
    }

    const thumbContainer = thumbnailRef.current;
    const activeThumb = thumbContainer?.children?.[normalizedIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const scrollThumbnailRail = (direction) => {
    const container = thumbnailRef.current;
    if (!container) return;

    const distance = Math.max(container.clientWidth * 0.8, 240);
    container.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const handleAddToCart = async () => {
    const currentStock = getCurrentStock();
    if (currentStock === 0) {
      setToastMessage("Out of stock!");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: getCurrentPrice(),
        images: product.images
      };
      
      if (product.has_variations && selectedVariation) {
        productToAdd.variation_id = selectedVariation.variation_id;
      }
      
      const result = await addToCart(productToAdd, qty, user);

      if (result.success) {
        setToastMessage(result.message || "Product added to cart!");
        setToastType("success");
        setShowToast(true);
        await checkCartStatus();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setToastMessage(result.message || "Failed to add to cart");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      setToastMessage('Failed to add to cart. Please try again.');
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveFromCart();
      return;
    }

    const currentStock = getCurrentStock();
    if (newQuantity > currentStock) {
      setToastMessage(`Only ${currentStock} items available in stock`);
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      const result = await updateCartItem(cartItemId, newQuantity, user?.id);

      if (result.success) {
        setCartQuantity(newQuantity);
        setToastMessage("Cart updated successfully");
        setToastType("success");
        setShowToast(true);
      } else {
        setToastMessage(result.message);
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Update cart error:', error);
      setToastMessage('Failed to update cart');
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const result = await removeFromCart(cartItemId, user);

      if (result.success) {
        setIsInCart(false);
        setCartItemId(null);
        setCartQuantity(0);
        setToastMessage("Item removed from cart");
        setToastType("success");
        setShowToast(true);
        await checkCartStatus();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setToastMessage(result.message);
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      setToastMessage('Failed to remove from cart');
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    const productToBuy = {
      id: product.id,
      name: product.name,
      price: getCurrentPrice(),
      image: mainImage,
      quantity: qty,
      type: 'buynow'
    };

    if (product.has_variations && selectedVariation) {
      productToBuy.variation_id = selectedVariation.variation_id;
      const attrNames = Object.values(selectedVariation.attributes || {}).map(a => a.value).join(', ');
      productToBuy.variation_name = attrNames;
    }

    if (!isAuthenticated()) {
      openAuthModal(() => navigate("/checkout", { state: { type: 'buynow', product: productToBuy } }));
      return;
    }

    navigate("/checkout", { state: { type: 'buynow', product: productToBuy } });
  };

  if (loading) {
    return (
      <div className="pd-container">
        <div className="pd-skeleton-breadcrumb">
          <div className="skel skel-breadcrumb" />
        </div>
        <div className="pd-main-section">
          {/* Image skeleton */}
          <div className="pd-image-wrapper">
            <div className="skel skel-main-img" />
            <div className="pd-skeleton-thumbs">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skel skel-thumb" />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div className="pd-info-wrapper">
            <div className="skel skel-badge" />
            <div className="skel skel-title" />
            <div className="skel skel-title skel-title-short" />
            <div className="skel skel-price" />
            <div className="skel skel-tax" />
            <div className="pd-skeleton-variations">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skel skel-var-btn" />
              ))}
            </div>
            <div className="skel skel-desc" />
            <div className="skel skel-desc skel-desc-short" />
            <div className="skel skel-delivery" />
            <div className="pd-skeleton-actions">
              <div className="skel skel-action-btn" />
              <div className="skel skel-action-btn skel-action-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-container">
        <div className="error-container">
          <p>Error: {error || 'Product not found'}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const currentStock = getCurrentStock();
  const currentPrice = getCurrentPrice();
  const currentComparePrice = getCurrentComparePrice();
  const discount = getCurrentDiscount();
  const imagesToShow = (selectedVariation?.images && selectedVariation.images.length > 0) 
    ? selectedVariation.images 
    : product.images;
  const imageUrls = (imagesToShow && imagesToShow.length > 0)
    ? imagesToShow.map((img) => getImageUrl(img, product?.has_variations))
    : ['https://via.placeholder.com/500x500?text=Product+Image'];
  const videosToShow = (selectedVariation?.videos && selectedVariation.videos.length > 0)
    ? selectedVariation.videos
    : product.product_videos;
  const productVideoUrls = (videosToShow && videosToShow.length > 0)
    ? videosToShow.map((vid) => getVideoUrl(vid, product?.has_variations)).filter(Boolean)
    : [];
  const mediaItems = [
    ...imageUrls.map((imageUrl, index) => ({
      type: "image",
      url: imageUrl,
      alt: `${product.name} view ${index + 1}`
    })),
    ...productVideoUrls.map((videoUrl, index) => ({
      // Uploaded GIFs land in the same "videos" array as real videos - render
      // them as images since <video> can't play a .gif source.
      type: /\.gif($|\?)/i.test(videoUrl) ? "image" : "video",
      url: videoUrl,
      alt: `${product.name} video ${index + 1}`
    }))
  ];

  const handleGalleryScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const nextIndex = Math.round(container.scrollLeft / container.offsetWidth);
    if (nextIndex !== activeImageIndex && mediaItems[nextIndex]) {
      setActiveImageIndex(nextIndex);
      if (mediaItems[nextIndex].type === "image") {
        setMainImage(mediaItems[nextIndex].url);
      }
      syncVideoPlayback(nextIndex, mediaItems);
    }
  };

  return (
    <div className="pd-container">
      {showToast && (
        <div className={`product-toast ${toastType}`}>
          {toastMessage}
        </div>
      )}

      <div className="breadcrumb">
        <span onClick={() => navigate('/')}>Home</span>
        {/* <ChevronRight size={14} />
        <span onClick={() => navigate('/products')}>Products</span> */}
        <ChevronRight size={14} />
        <span className="active">{product.name}</span>
      </div>

      <div className="pd-main-section">
        <div className="pd-image-wrapper">
          <div className="badges">
            {discount >= 50 && <span className="discount-badge">{discount}% OFF</span>}
            {currentStock > 0 && currentStock < 10 && <span className="stock-badge">Only {currentStock} left</span>}
          </div>
          
          <div className="main-img-container">
            {mediaItems.length > 1 && (
              <button
                className="gallery-arrow gallery-arrow-left"
                onClick={() => scrollToImage(activeImageIndex - 1, mediaItems)}
                disabled={activeImageIndex === 0}
                aria-label="Previous product media"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div className="image-scroll-container" ref={scrollRef} onScroll={handleGalleryScroll}>
              {mediaItems.map((media, i) => (
                media.type === "video" ? (
                  <video
                    key={`${media.url}-${i}`}
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={media.url}
                    className="main-video-large"
                    controls
                    muted
                    preload="metadata"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    key={`${media.url}-${i}`}
                    src={media.url}
                    alt={media.alt}
                    className="main-img-large"
                    onClick={() => {
                      setMainImage(media.url);
                      setActiveImageIndex(i);
                      setIsModalOpen(true);
                    }}
                  />
                )
              ))}
            </div>

            {mediaItems.length > 1 && (
              <button
                className="gallery-arrow gallery-arrow-right"
                onClick={() => scrollToImage(activeImageIndex + 1, mediaItems)}
                disabled={activeImageIndex === mediaItems.length - 1}
                aria-label="Next product media"
              >
                <ChevronRight size={22} />
              </button>
            )}

            <div className="image-count-badge">
              {activeImageIndex + 1} / {mediaItems.length}
            </div>
          </div>

          {mediaItems.length > 1 && (
            <div className="gallery-footer">
              <button
                className="thumb-scroll-btn"
                onClick={() => scrollThumbnailRail(-1)}
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="thumbnail-container" ref={thumbnailRef}>
                {mediaItems.map((media, i) => (
                  <button
                    key={`${media.url}-thumb-${i}`}
                    className={`thumbnail ${media.type === "video" ? "video-thumbnail" : ""} ${activeImageIndex === i ? 'active' : ''}`}
                    onClick={() => scrollToImage(i, mediaItems)}
                    aria-label={`View product ${media.type} ${i + 1}`}
                  >
                    {media.type === "video" ? (
                      <span className="video-thumb-content">
                        <PlayCircle size={22} />
                        <span>Video</span>
                      </span>
                    ) : (
                      <img src={media.url} alt={`${product.name} thumbnail ${i + 1}`} />
                    )}
                  </button>
                ))}
              </div>

              <button
                className="thumb-scroll-btn"
                onClick={() => scrollThumbnailRail(1)}
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {mediaItems.length > 1 && (
            <div className="image-dots">
              {mediaItems.map((media, i) => (
                <button
                  key={`${media.type}-${i}`}
                  className={`dot ${activeImageIndex === i ? 'active-dot' : ''}`}
                  onClick={() => scrollToImage(i, mediaItems)}
                  aria-label={`Go to product ${media.type} ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pd-info-wrapper">
          <div className="brand-name">{product.category?.name || "Premium Brand"}</div>
          <h1 className="pd-title-new">{product.name}</h1>

          <div className="pd-price-row">
            <span className="current-price">₹{parseFloat(currentPrice).toLocaleString('en-IN')}</span>
            {currentComparePrice && parseFloat(currentComparePrice) > parseFloat(currentPrice) && (
              <>
                <span className="old-price">₹{parseFloat(currentComparePrice).toLocaleString('en-IN')}</span>
                <span className="discount-tag">Save {discount}%</span>
              </>
            )}
          </div>

          <div className="tax-info">Inclusive of all taxes</div>

          {product.has_variations && availableAttributes.length > 0 && (
            <div className="variation-section">
              {availableAttributes.map(attr => (
                <div key={attr.attribute_id} className="variation-group">
                  <label className="variation-label">
                    {attr.attribute_name}:
                    <span className="selected-value">
                      {selectedAttributes[attr.attribute_id] 
                        ? attr.values.find(v => v.id === selectedAttributes[attr.attribute_id])?.value 
                        : 'Select'}
                    </span>
                  </label>
                  <div className="variation-options">
                    {attr.values.map(value => (
                      <button
                        key={value.id}
                        className={`variation-btn ${selectedAttributes[attr.attribute_id] === value.id ? 'active' : ''}`}
                        onClick={() => handleAttributeSelect(attr.attribute_id, value.id)}
                        style={
                          attr.attribute_name === 'Color' && value.color_code
                            ? { backgroundColor: value.color_code, color: '#fff', border: 'none' }
                            : {}
                        }
                      >
                        {value.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="pd-short-desc">{product.short_description || product.description?.substring(0, 150) || 'Premium quality product'}</p>

          <div className="stock-status-section">
            {currentStock > 10 ? (
              <span className="in-stock"><CheckCircle size={16} /> In Stock</span>
            ) : currentStock > 0 ? (
              <span className="low-stock"><Zap size={16} /> Only {currentStock} left - Order soon!</span>
            ) : (
              <span className="out-stock"><AlertCircle size={16} /> Out of Stock</span>
            )}
          </div>

          <div className="delivery-info">
            <div className="delivery-text"><Truck size={16} /><span>Free delivery on orders above ₹499</span></div>
            <div className="delivery-text"><Clock size={16} /><span>Estimated delivery: <strong>3-5 business days</strong></span></div>
            <div className="delivery-text"><RefreshCw size={16} /><span>7-day easy returns</span></div>
          </div>

          <div className="pd-action-row">
            {isInCart ? (
              <div className="cart-quantity-controls">
                <div className="qty-selector-cart">
                  <button onClick={() => handleUpdateQuantity(cartQuantity - 1)} disabled={currentStock === 0} className="qty-btn-cart"><Minus size={14} /></button>
                  <span className="qty-value-cart">{cartQuantity}</span>
                  <button onClick={() => handleUpdateQuantity(cartQuantity + 1)} disabled={currentStock === 0 || cartQuantity >= currentStock} className="qty-btn-cart"><Plus size={14} /></button>
                </div>
                <button className="remove-from-cart-btn" onClick={handleRemoveFromCart}><Trash2 size={16} /> Remove</button>
              </div>
            ) : (
              <button className="pd-add-to-bag-btn" onClick={handleAddToCart} disabled={currentStock === 0}>
                <ShoppingBag size={18} /> ADD TO CART
              </button>
            )}
            <button className="buy-now-btn" onClick={handleBuyNow} disabled={currentStock === 0}>Buy Now</button>

            {/* Share Button */}
            <div className="share-menu-container">
              <button 
                className="share-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareMenu(!showShareMenu);
                }}
              >
                <Share2 size={20} />
              </button>
              
              {showShareMenu && (
                <div className="share-menu">
                  <button onClick={shareOnWhatsApp} className="share-option whatsapp">
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </button>
                  <button onClick={copyToClipboard} className="share-option copy">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {(() => {
            const retailers = (product.has_variations ? selectedVariation?.online_retailers : product.online_retailers) || [];
            const isOnline = product.has_variations ? selectedVariation?.is_online : product.is_online;
            return isOnline && retailers.length > 0 ? (
              <div className="buy-online-row">
                <button className="buy-online-btn" onClick={() => setIsOnlineSidebarOpen(true)}>
                   Buy from Amazon, Flipkart & Similar platforms
                </button>
              </div>
            ) : null;
          })()}

          <div className="secure-checkout"><Shield size={14} /><span>Secure checkout • 100% Safe Shopping</span></div>
        </div>
      </div>

      {isModalOpen && (
        <div className="image-zoom-modal" onClick={() => setIsModalOpen(false)}>
          <span className="close-modal">×</span>
          <img src={mainImage} alt="Zoomed" className="zoomed-img" />
        </div>
      )}

      <div className="pd-info-section-container">
        <div className="pd-tabs-navbar">
          <button className={`info-tab-btn ${activeTab === "Description" ? "active" : ""}`} onClick={() => setActiveTab("Description")}>Product Description</button>
          <button className={`info-tab-btn ${activeTab === "Details" ? "active" : ""}`} onClick={() => setActiveTab("Details")}>Product Details</button>
          <button className={`info-tab-btn ${activeTab === "Shipping" ? "active" : ""}`} onClick={() => setActiveTab("Shipping")}>Shipping & Returns</button>
        </div>

        <div className="info-content-panel">
          {activeTab === "Description" && (
            <div className="info-tab-pane">
             <div
  className="info-text"
  dangerouslySetInnerHTML={{
    __html: product.description || 'Premium quality product'
  }}
/>
            </div>
          )}
          {activeTab === "Details" && (
            <div className="info-tab-pane">
              <div className="info-grid-details">
                <div className="detail-item"><strong>Product Name:</strong> {product.name}</div>
                <div className="detail-item"><strong>Category:</strong> {product.category?.name || 'Beauty'}</div>
                <div className="detail-item"><strong>Availability:</strong> {currentStock > 0 ? 'In Stock' : 'Out of Stock'}</div>
                {selectedVariation?.sku && <div className="detail-item"><strong>SKU:</strong> {selectedVariation.sku}</div>}
              </div>
            </div>
          )}
          {activeTab === "Shipping" && (
            <div className="info-tab-pane">
              <div className="shipping-info">
                <h4><Truck size={18} /> Shipping Policy:</h4>
                <ul><li>Free shipping on orders above ₹499</li><li>Standard shipping charges: ₹49</li><li>Estimated delivery: 3-5 business days</li></ul>
                <h4><RefreshCw size={18} /> Return Policy:</h4>
                <ul><li>7-day easy return policy</li><li>Product must be unused and in original packaging</li></ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy Online Sidebar */}
      {isOnlineSidebarOpen && (() => {
        const retailers = (product.has_variations ? selectedVariation?.online_retailers : product.online_retailers) || [];
        return (
          <div className="buy-online-overlay" onClick={() => setIsOnlineSidebarOpen(false)}>
            <div className="buy-online-sidebar" onClick={(e) => e.stopPropagation()}>
              <button className="buy-online-close" onClick={() => setIsOnlineSidebarOpen(false)}>×</button>
              <p className="buy-online-heading">Buy now from your favorite retailers</p>
              <div className="buy-online-retailers">
                {retailers.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-online-retailer-card"
                  >
                    {r.image && (
                      <img
                        src={getImageUrl(r.image)}
                        alt={r.title}
                        className="retailer-logo"
                      />
                    )}
                    <span className="retailer-name">{r.title}</span>
                    <span className="retailer-buy-btn">Buy Now</span>
                  </a>
                ))}
                {retailers.length === 0 && (
                  <p className="buy-online-empty">No retailers available.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {relatedProducts.length > 0 && (
        <div className="pd-related-section">
          <div className="related-section-header">
            <span className="related-eyebrow">Curated picks</span>
            <h2 className="related-title-main">You May Also Like</h2>
            <p className="related-subtitle">More products that match this shade, routine, or finish.</p>
          </div>
          <div className="related-grid-new">
            {relatedProducts.slice(0, 4).map((item) => (
              <button key={item.id} className="related-card-new" onClick={() => navigate(`/product/${item.slug || item.id}`)}>
                <div className="rel-img-box">
                  <span className="rel-badge">{item.category?.name || item.category_name || "Beauty"}</span>
                  <img src={getImageUrl(item.display_image, item.has_variations)} alt={item.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }} />
                </div>
                <div className="rel-info-box">
                  <p className="rel-name">{item.name}</p>
                  <div className="rel-meta-row">
                    <p className="rel-price">{formatRelatedPrice(item.display_price)}</p>
                    <span className="rel-cta">View</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
