// src/components/PaymentFailed.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home, ShoppingBag, Headphones } from 'lucide-react';
import "./Payment.css";
const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    setError(errorMsg);
  }, [searchParams]);

  const getErrorMessage = () => {
    switch(error) {
      case 'invalid_hash':
        return 'Invalid payment verification. Please try again.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      case 'payment_failed':
        return 'Your payment was declined. Please use a different payment method.';
      case 'cancelled':
        return 'Payment was cancelled. You can try again.';
      default:
        return 'Something went wrong with your payment. Please try again.';
    }
  };

  return (
    <div className="payment-failed-container">
      <div className="failed-card">
        <div className="failed-icon">
          <AlertCircle size={80} color="#dc3545" />
        </div>
        
        <h1>Payment Failed! 😞</h1>
        <p className="error-message">{getErrorMessage()}</p>
        
        <div className="error-details">
          <p><strong>Error Code:</strong> {error || 'UNKNOWN_ERROR'}</p>
          <p><strong>What went wrong?</strong> Your payment could not be processed.</p>
        </div>

        <div className="suggestions">
          <h4>Try these solutions:</h4>
          <ul>
            <li>Use a different payment method</li>
            <li>Check your card details and try again</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Contact your bank for more information</li>
          </ul>
        </div>

        <div className="button-group">
          <button onClick={() => window.location.reload()} className="btn-retry">
            <RefreshCw size={18} />
            Try Again
          </button>
          <button onClick={() => navigate('/')} className="btn-home">
            <Home size={18} />
            Go Home
          </button>
          {/* <button onClick={() => navigate('/cart')} className="btn-cart">
            <ShoppingBag size={18} />
            View Cart
          </button> */}
        </div>

        <div className="help-text">
          <Headphones size={16} />
          <span>Need assistance? Call us at <strong>+91 7208812112</strong> or email <strong>hello@hogaacosmetics.com</strong></span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;