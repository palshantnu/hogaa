import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart, placeOrder, fetchShippingConfig, calculateShippingCharge } from "../utils/cart";
import { useAuth } from "../context/AuthContext";
import { trackPixel, savePendingPurchase } from "../utils/metaPixel";
import {
  Truck,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  CheckCircle,
  Package,
  Loader,
  Receipt
} from "lucide-react";
import "./Checkout.css";
import heroImg from "../assets/checkout1.jpg";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutType, setCheckoutType] = useState('cart');
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    base_total: 0
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    paymentMethod: 'payu'
  });
  const [orderResult, setOrderResult] = useState(null);
  const [shippingConfig, setShippingConfig] = useState(null);

  // Meta Pixel: InitiateCheckout once the items are loaded
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (loading || checkoutTracked.current || cart.length === 0) return;
    checkoutTracked.current = true;
    trackPixel('InitiateCheckout', {
      content_ids: cart.map(item => String(item.product_id || item.id)),
      content_type: 'product',
      num_items: cart.reduce((n, item) => n + (Number(item.quantity) || 0), 0),
      value: Number(cartTotals.subtotal) || 0,
      currency: 'INR'
    });
  }, [loading, cart, cartTotals.subtotal]);

  // Load shipping charge config (same state / other state) once
  useEffect(() => {
    fetchShippingConfig().then(setShippingConfig);
  }, []);

  // Auto-fill user details
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phone: user.mobile || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      }));
    }
  }, [user]);

  // Load checkout data based on type
  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoading(true);

      const type = location.state?.type;
      setCheckoutType(type === 'buynow' ? 'buynow' : 'cart');

      if (type === 'buynow' && location.state?.product) {
        // Buy Now: Single product
        const product = location.state.product;
        setCart([{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
          image: product.image,
          product: product,
          variation_name: product.variation_name,
          variation_id: product.variation_id,
          cgst_rate: product.cgst_rate || 9,
          sgst_rate: product.sgst_rate || 9,
          igst_rate: product.igst_rate || 0
        }]);
        
        // Calculate totals for buy now (GST Inclusive)
        const subtotal = parseFloat(product.price) * (product.quantity || 1);
        const cgstRate = product.cgst_rate || 9;
        const sgstRate = product.sgst_rate || 9;
        const igstRate = product.igst_rate || 0;
        
        const totalGstRate = cgstRate + sgstRate + igstRate;
        let cgst = 0, sgst = 0, igst = 0, tax = 0;
        
        if (totalGstRate > 0) {
          tax = (subtotal * totalGstRate) / (100 + totalGstRate);
          cgst = (tax * cgstRate) / totalGstRate;
          sgst = (tax * sgstRate) / totalGstRate;
          igst = (tax * igstRate) / totalGstRate;
        }
        
        const baseTotal = subtotal - tax;
        const shipping = 0;
        const total = subtotal;
        
        setCartTotals({
          subtotal: subtotal,
          cgst: cgst,
          sgst: sgst,
          igst: igst,
          tax: tax,
          shipping: shipping,
          total: total,
          base_total: baseTotal
        });
      } else {
        // Cart Checkout: Load full cart from API
        try {
          const cartData = await getCart(user);
          setCart(cartData);
          
          const response = await fetch(`https://admin.hogaacosmetics.com/api/cart?user_id=${user?.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success && data.cart) {
            const subtotal = data.cart.subtotal;
            const tax = data.cart.tax || 0;
            const baseTotal = subtotal - tax;
            
            setCartTotals({
              subtotal: subtotal,
              cgst: data.cart.cgst || 0,
              sgst: data.cart.sgst || 0,
              igst: data.cart.igst || 0,
              tax: tax,
              shipping: data.cart.shipping || 0,
              total: data.cart.total,
              base_total: baseTotal
            });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }

      setLoading(false);
    };

    loadCheckoutData();
  }, [location.state, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const total = cart.reduce((acc, item) => {
    const price = parseFloat(item.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  // Shipping charge is derived live from the state typed into the address form
  const shippingCharge = calculateShippingCharge(formData.state, shippingConfig);
  const displayTotals = { ...cartTotals, shipping: shippingCharge };

  const validateShippingForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email ||
      !formData.address || !formData.city || !formData.state || !formData.pincode || !formData.phone) {
      alert("Please fill in all shipping details");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateShippingForm()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Initiate PayU Payment
  const initiatePayUPayment = async (order) => {
    try {
      const paymentResponse = await fetch('https://admin.hogaacosmetics.com/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          user_id: user?.id,
          amount: order.total
        })
      });
      
      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        // Create a form and submit to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.payuUrl;
        
        Object.keys(paymentData.paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData.paymentData[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Failed to initiate payment. Please try again.");
        setPlacingOrder(false);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert("Payment gateway error. Please try again.");
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
console.log('cart',cart);

    const orderData = {
      shippingDetails: formData,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variation_id: item.variation_id,
        variation_name: item.variation_name
      })),
      total: cartTotals.subtotal,
      paymentMethod: formData.paymentMethod,
      checkoutType: checkoutType
    };

    const result = await placeOrder(orderData, user);

    if (result.success) {
      setOrderResult(result.order);
      savePendingPurchase(
        result.order.id,
        result.order.total ?? cartTotals.subtotal,
        cart.map(item => String(item.product_id || item.id))
      );
      await initiatePayUPayment(result.order);
    } else {
      alert(result.message || "Failed to place order");
      setPlacingOrder(false);
      setCurrentStep(2);
    }
  };

  const getImageUrl = (item) => {
    if (item.image) return item.image;
    if (item.product?.images?.[0]) {
      const imagePath = item.product.images[0];
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
      if (imagePath.startsWith('/uploads/')) return `https://admin.hogaacosmetics.com${imagePath}`;
      return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
    }
    if (item.images?.length > 0) {
      return `https://admin.hogaacosmetics.com/uploads/products/${item.images[0]}`;
    }
    return 'https://via.placeholder.com/60x60?text=No+Image';
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <div className="page-hero">
          <img src={heroImg} alt="Checkout Banner" />
          <div className="hero-overlay">
            <h1>Checkout</h1>
          </div>
        </div>
        <div className="checkout-container">
          <div className="empty-cart-message">
            <div className="empty-icon">🛒</div>
            <h3>No items to checkout</h3>
            <p>Please add some products to your cart first.</p>
            <button onClick={() => navigate('/')} className="continue-shopping-btn">
              Continue Shopping
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-hero">
        <img src={heroImg} alt="Checkout Banner" />
        <div className="hero-overlay">
          <h1>Secure Checkout</h1>
          <p>{checkoutType === 'buynow' ? 'Buy Now' : `Cart Checkout (${cart.length} items)`}</p>
        </div>
      </div>

      <div className="checkout-container">
        {/* Steps Indicator */}
        <div className="checkout-steps">
          <div
            className={`step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}
            onClick={() => currentStep > 1 && setCurrentStep(1)}
          >
            <span className="step-number">{currentStep > 1 ? '✓' : '1'}</span>
            <span className="step-text">Shipping</span>
          </div>
          <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div
            className={`step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => currentStep > 2 && setCurrentStep(2)}
          >
            <span className="step-number">{currentStep > 2 ? '✓' : '2'}</span>
            <span className="step-text">Payment</span>
          </div>
          <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-text">Confirmation</span>
          </div>
        </div>

        {/* Step 1: Shipping Address */}
        {currentStep === 1 && (
          <div className="checkout-layout">
            <div className="billing-section">
              <div className="section-header">
                <MapPin size={22} />
                <h2 className="section-title">Shipping Address</h2>
              </div>

              <form className="checkout-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Street Address <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address"
                    placeholder="House number and street name"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    placeholder="Apartment, floor, building"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>City <span className="required">*</span></label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>State <span className="required">*</span></label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Pincode <span className="required">*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Postal code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="delivery-options">
                  <h3>Delivery Options</h3>
                  <div className="delivery-option selected">
                    <div className="delivery-radio">
                      <input type="radio" checked readOnly />
                    </div>
                    <div className="delivery-details">
                      <strong>Standard Delivery</strong>
                      <span>FREE</span>
                    </div>
                    <div className="delivery-estimate">Est. 3-5 business days</div>
                  </div>
                </div>
              </form>
            </div>

            <div className="order-summary-section">
              <OrderSummary 
                cart={cart} 
                cartTotals={displayTotals} 
                getImageUrl={getImageUrl}
              />
              <button className="next-step-btn" onClick={handleNextStep}>
                Continue to Payment
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === 2 && (
          <div className="checkout-layout">
            <div className="billing-section">
              <div className="section-header">
                <CreditCard size={22} />
                <h2 className="section-title">Payment Method</h2>
              </div>
              <div className="payment-methods-full">
                {/* PayU / Online Payment Option */}
                <label className="payment-option-full selected">
                  <input type="radio" name="paymentMethod" value="payu" checked readOnly />
                  <div className="payment-icon"><CreditCard size={28} /></div>
                  <div className="payment-info">
                    <strong>Credit/Debit Card, Net Banking, UPI</strong>
                    <span>Pay securely via PayU</span>
                  </div>
                  <CheckCircle size={20} className="check-icon" />
                </label>
              </div>
            </div>
            <div className="order-summary-section">
              <OrderSummary 
                cart={cart} 
                cartTotals={displayTotals} 
                getImageUrl={getImageUrl}
              />
              <div className="step-buttons">
                <button className="prev-step-btn" onClick={handlePrevStep}><ChevronLeft size={18} /> Back</button>
                <button className="next-step-btn" onClick={handleNextStep}>Review Order <ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="checkout-layout">
            <div className="billing-section">
              <div className="section-header"><Package size={22} /><h2>Review Your Order</h2></div>
              <div className="review-section">
                <div className="review-card">
                  <h3>Shipping Address</h3>
                  <div className="review-content">
                    <p><strong>{formData.firstName} {formData.lastName}</strong></p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.pincode}</p>
                    <p>📞 {formData.phone}</p>
                  </div>
                </div>
                <div className="review-card">
                  <h3>Payment Method</h3>
                  <div className="review-content">
                    <p>💳 Credit/Debit Card (PayU)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-summary-section">
              <OrderSummary 
                cart={cart} 
                cartTotals={displayTotals} 
                getImageUrl={getImageUrl}
              />
              <div className="step-buttons">
                <button className="prev-step-btn" onClick={handlePrevStep}><ChevronLeft size={18} /> Back</button>
                <button className={`place-order-btn ${placingOrder ? 'loading' : ''}`} onClick={handlePlaceOrder} disabled={placingOrder}>
                  {placingOrder ? <><Loader size={18} className="spinning" /> Processing...</> : <>Confirm & Place Order <ChevronRight size={18} /></>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// OrderSummary Component
const OrderSummary = ({ cart, cartTotals, getImageUrl }) => {
  const calculateGSTPercentage = (amount, total) => {
    if (total === 0) return 0;
    return ((amount / total) * 100).toFixed(2);
  };

  return (
    <>
      <div className="summary-header">
        <h3>Order Summary</h3>
        <span className="item-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
      </div>
      
      <div className="order-items-list">
        {cart.map((item, index) => (
          <div key={item.id || index} className="summary-item">
            <div className="item-img-name">
              <img 
                src={getImageUrl(item)} 
                alt={item.name} 
                className="mini-img" 
                onError={(e) => e.target.src = 'https://via.placeholder.com/60x60'}
              />
              <div className="item-info">
                <span className="item-name">{item.name} {item.variation_name && `(${item.variation_name})`}</span>
                <span className="item-quantity">Qty: {item.quantity}</span>
              </div>
            </div>
            <span className="item-subtotal">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="price-breakdown">
        <div className="price-row">
          <span>Subtotal (GST Inclusive)</span>
          <span>₹{cartTotals.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="gst-breakdown">
          {cartTotals.cgst > 0 && (
            <div className="price-row gst-row">
              <span>CGST ({calculateGSTPercentage(cartTotals.cgst, cartTotals.subtotal)}%)</span>
              <span>₹{cartTotals.cgst.toFixed(2)}</span>
            </div>
          )}
          {cartTotals.sgst > 0 && (
            <div className="price-row gst-row">
              <span>SGST ({calculateGSTPercentage(cartTotals.sgst, cartTotals.subtotal)}%)</span>
              <span>₹{cartTotals.sgst.toFixed(2)}</span>
            </div>
          )}
          {console.log('cartTotals',cartTotals)
          }
          {cartTotals.igst > 0 && (
            <div className="price-row gst-row">
              <span>IGST ({calculateGSTPercentage(cartTotals.igst, cartTotals.subtotal)}%)</span>
              <span>₹{cartTotals.igst.toFixed(2)}</span>
            </div>
          )}
          <div className="price-row total-tax-row">
            <span>Total GST (Included)</span>
            <span>₹{cartTotals.tax.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="price-row">
          <span>Base Price (Excluding GST)</span>
          <span>₹{(cartTotals.base_total || (cartTotals.subtotal - cartTotals.tax)).toFixed(2)}</span>
        </div>

        <div className="price-row">
          <span>Shipping Charge</span>
          <span>{cartTotals.shipping > 0 ? `₹${cartTotals.shipping.toFixed(2)}` : 'FREE'}</span>
        </div>

        <div className="price-divider"></div>

        <div className="price-row total-row">
          <span>Total Amount</span>
          <span>₹{(cartTotals.subtotal + (cartTotals.shipping || 0)).toFixed(2)}</span>
        </div>
      </div>

      <div className="trust-badges">
        <div className="trust-item"><Truck size={16} /><span>Fast Delivery</span></div>
        <div className="trust-item"><Shield size={16} /><span>Secure Payment</span></div>
        <div className="trust-item"><CreditCard size={16} /><span>100% Refund</span></div>
      </div>
    </>
  );
};

export default Checkout;
