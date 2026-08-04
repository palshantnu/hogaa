import React, { useEffect, useState } from "react";
import { getCart, updateCartItem, removeFromCart, getCartTotals } from "../utils/cart";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Truck, 
  Shield, 
  CreditCard,
  ChevronRight,
  Tag,
  Gift
} from "lucide-react";
import "./Cart.css";
import heroImg from "../assets/cart1.jpg";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    item_count: 0
  });
  const [updating, setUpdating] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  
  const getStoredUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  const user = getStoredUser();

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);
      const totals = await getCartTotals();
      if (totals) {
        setCartTotals(totals);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQty = async (cartItemId, productId, currentQty, newQty) => {
    if (newQty < 1) return;
    if (newQty === currentQty) return;
    
    setUpdating(productId);
    try {
      const result = await updateCartItem(cartItemId, newQty, user?.id);
      if (result.success) {
        await loadCart();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (cartItemId, productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setUpdating(productId);
      try {
        const result = await removeFromCart(cartItemId);
        if (result.success) {
          await loadCart();
          setSelectedItems(prev => prev.filter(id => id !== productId));
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item');
      } finally {
        setUpdating(null);
      }
    }
  };

const getImageUrl = (product, item) => {
  const images = product?.images?.length
    ? product.images
    : item?.images?.length
    ? item.images
    : [];

  if (!images.length) {
    return 'https://via.placeholder.com/120x120?text=No+Image';
  }

  const imagePath =
    item?.variation?.images?.[0] || images[0];

  if (!imagePath) {
    return 'https://via.placeholder.com/120x120?text=No+Image';
  }

  // Full URL already
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  // Existing uploads path
  if (imagePath.startsWith('/uploads/')) {
    return `https://admin.hogaacosmetics.com${imagePath}`;
  }

  // Detect variation image automatically
  const isVariationImage =
    imagePath.startsWith('variation-');

  // Variation image URL
  if (isVariationImage) {
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${imagePath}`;
  }

  // Normal product image URL
  return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
};

  const selectedTotal = cart
    .filter(item => selectedItems.includes(item.product_id))
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  useEffect(() => {
    setSelectedItems(cart.map(item => item.product_id));
  }, [cart]);

  const handleApplyCoupon = () => {
    if (couponCode === "SAVE10") {
      setCouponApplied(true);
      alert("Coupon applied! 10% discount added.");
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one product");
      return;
    }
    if (!isAuthenticated()) {
      openAuthModal(() => goToCheckout());
      return;
    }
    goToCheckout();
  };

  const goToCheckout = () => {
    const selectedProducts = cart.filter(item => selectedItems.includes(item.product_id));
    navigate("/checkout", {
      state: { selectedProducts, totals: cartTotals, selectedTotal }
    });
  };

  // Calculate base price (price excluding GST)
  const calculateBasePrice = (price, cgstRate, sgstRate, igstRate) => {
    const totalGstRate = (cgstRate || 0) + (sgstRate || 0) + (igstRate || 0);
    if (totalGstRate === 0) return price;
    return (price * 100) / (100 + totalGstRate);
  };

  const discountAmount = couponApplied ? cartTotals.subtotal * 0.1 : 0;
  const finalTotal = cartTotals.total - discountAmount;

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner-modern">
          <div className="spinner-ring"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }
console.log('cart===>',cart);

  return (
    <>
      <div className="cart-hero"  style={{backgroundColor:'#fff'}}>
        <div className="cart-hero-content">
          <h1>Shopping Cart</h1>
          <p>{cartTotals.item_count} items in your bag</p>
        </div>
      </div>

      <div className="cart-wrapper2"  style={{backgroundColor:'#fff'}}>
        <div style={{backgroundColor:'#fff'}} className="cart-container-modern">
          {cart.length === 0 ? (
            <div className="empty-cart-modern">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <Link to="/" className="continue-shopping-btn-modern">
                Start Shopping
                <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Left Section - Cart Items */}
              <div className="cart-items-section">
                <div className="cart-header-modern">
                  <div className="cart-header-labels">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Total</span>
                    <span></span>
                  </div>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => {
                    const basePrice = calculateBasePrice(item.price, item.cgst_rate, item.sgst_rate, item.igst_rate);
                    const gstAmount = item.price - basePrice;
                    
                    return (
                      <div key={item.cartItemId} className="cart-item-modern">
                        <div className="cart-item-details">
                          <div className="cart-item-image">
                            <img 
                              src={getImageUrl(item.product, item)} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="cart-item-info">
                            <h4>{item.name} {item.variation_name && `(${item.variation_name})`}</h4>
                            <div className="cart-item-price">
                              ₹{Number(item.price).toFixed(2)}
                              {item.product?.compare_price && 
                               parseFloat(item.product.compare_price) > parseFloat(item.price) && (
                                <span className="cart-item-original-price">
                                  ₹{parseFloat(item.product.compare_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="cart-item-gst-info">
                              <small className="text-muted">
                                Base: ₹{basePrice.toFixed(2)} + GST: ₹{gstAmount.toFixed(2)}
                              </small>
                            </div>
                            {item.product?.compare_price && 
                             parseFloat(item.product.compare_price) > parseFloat(item.price) && (
                              <div className="cart-item-discount">
                                Save {Math.round(((item.product.compare_price - item.price) / item.product.compare_price) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="cart-item-quantity">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => handleQty(item.cartItemId, item.product_id, item.quantity, item.quantity - 1)}
                              disabled={updating === item.product_id}
                              className="qty-btn"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button 
                              onClick={() => handleQty(item.cartItemId, item.product_id, item.quantity, item.quantity + 1)}
                              disabled={updating === item.product_id}
                              className="qty-btn"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="cart-item-total">
                          <span className="item-total-price">
                            ₹{(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            className="remove-item-btn"
                            onClick={() => handleRemove(item.cartItemId, item.product_id)}
                            disabled={updating === item.product_id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Features */}
                <div className="delivery-features">
                  <div className="feature">
                    <Truck size={20} />
                    <div>
                      <strong>Free Delivery</strong>
                      <p>On orders above ₹500</p>
                    </div>
                  </div>
                  <div className="feature">
                    <Shield size={20} />
                    <div>
                      <strong>Secure Payment</strong>
                      <p>100% secure transactions</p>
                    </div>
                  </div>
                  <div className="feature">
                    <Gift size={20} />
                    <div>
                      <strong>Free Gift</strong>
                      <p>On orders above ₹999</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Order Summary */}
              <div className="order-summary-section">
                <div className="order-summary-card">
                  <h3>Order Summary</h3>
                  
                  <div className="summary-row">
                    <span>Subtotal (GST Inclusive)</span>
                    <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* GST Breakdown - Show how much GST is included */}
                  <div className="gst-breakdown">
                    <div className="summary-row gst-row">
                      <span>CGST ({cartTotals.subtotal > 0 ? ((cartTotals.cgst / cartTotals.subtotal) * 100).toFixed(2) : 0}%)</span>
                      <span>₹{cartTotals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row gst-row">
                      <span>SGST ({cartTotals.subtotal > 0 ? ((cartTotals.sgst / cartTotals.subtotal) * 100).toFixed(2) : 0}%)</span>
                      <span>₹{cartTotals.sgst.toFixed(2)}</span>
                    </div>
                    {cartTotals.igst > 0 && (
                      <div className="summary-row gst-row">
                        <span>IGST ({cartTotals.subtotal > 0 ? ((cartTotals.igst / cartTotals.subtotal) * 100).toFixed(2) : 0}%)</span>
                        <span>₹{cartTotals.igst.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="summary-row total-tax">
                      <span>Total GST (Included)</span>
                      <span>₹{cartTotals.tax.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* <div className="summary-row">
                    <span>Base Price (Excluding GST)</span>
                    <span>₹{(cartTotals.subtotal - cartTotals.tax).toFixed(2)}</span>
                  </div> */}
                  
                  {/* <div className="summary-row">
                    <span>Shipping</span>
                    <span>{cartTotals.shipping === 0 ? 'Free' : `₹${cartTotals.shipping.toFixed(2)}`}</span>
                  </div>
                   */}
                  {couponApplied && (
                    <div className="summary-row discount">
                      <span>Discount (10%)</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{cartTotals.subtotal}</span>
                  </div>
                  
                  {/* Coupon Section */}
                  {/* <div className="coupon-section">
                    <div className="coupon-input-group">
                      <Tag size={18} />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={couponApplied}
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={couponApplied || !couponCode}
                        className="apply-coupon-btn"
                      >
                        {couponApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {!couponApplied && (
                      <p className="coupon-hint">Try "SAVE10" for 10% off</p>
                    )}
                  </div> */}
                  
                  <button 
                    className="checkout-btn-modern"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    Proceed to Checkout
                    <ChevronRight size={18} />
                  </button>
                  
                  <div className="payment-methods">
                    <p>Secure checkout with:</p>
                    <div className="payment-icons">
                      <CreditCard size={24} />
                      <span>💳</span>
                      <span>📱</span>
                      <span>🏦</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;