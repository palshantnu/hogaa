// src/components/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, CreditCard, Home, ShoppingBag } from 'lucide-react';
import "./Payment.css";
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const txnid = searchParams.get('txnid');

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`https://admin.hogaacosmetics.com/api/payment/status/${orderId}`);
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderStatus();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={80} color="#28a745" />
        </div>
        
        <h1>Payment Successful! 🎉</h1>
        <p className="success-message">Your order has been placed successfully.</p>
        
        <div className="order-info">
          <div className="info-row">
            <span className="info-label">Order Number:</span>
            <span className="info-value">{orderDetails?.order_number || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Transaction ID:</span>
            <span className="info-value">{txnid || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Status:</span>
            <span className="info-value success-text">{orderDetails?.payment_status || 'Paid'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Status:</span>
            <span className="info-value">{orderDetails?.order_status || 'Confirmed'}</span>
          </div>
        </div>

        <div className="delivery-info">
          <div className="delivery-item">
            <Truck size={18} />
            <span>Estimated delivery: 3-5 business days</span>
          </div>
          <div className="delivery-item">
            <Clock size={18} />
            <span>Order confirmed! You will receive updates via email/SMS</span>
          </div>
          <div className="delivery-item">
            <Package size={18} />
            <span>Free shipping on orders above ₹499</span>
          </div>
        </div>

        <div className="button-group">
          {/* <button onClick={() => navigate('/orders')} className="btn-view-orders">
            <ShoppingBag size={18} />
            View Orders
          </button> */}
          <button onClick={() => navigate('/')} className="btn-continue-shopping">
            <Home size={18} />
            Continue Shopping
          </button>
        </div>

        <div className="help-text">
          <p>Need help? Contact us at <a href="mailto:hello@hogaacosmetics.com">support@hogaacosmetics.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;