import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OtpModal.css';

const OtpModal = ({ onSuccess, onClose }) => {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const boxRefs = useRef([]);

  useEffect(() => {
    if (step === 1) document.getElementById('otp-mobile-input')?.focus();
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    const res = await sendOtp(mobile);
    setLoading(false);
    if (res.success) {
      setStep(2);
      setTimeout(() => boxRefs.current[0]?.focus(), 100);
    } else {
      setError(res.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digits = [...otpDigits];
    digits[index] = value.slice(-1);
    setOtpDigits(digits);
    setError('');
    if (value && index < 5) boxRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) boxRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) boxRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      boxRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    const res = await verifyOtp(mobile, otp);
    setLoading(false);
    if (res.success) {
      onSuccess(res.user);
    } else {
      setError(res.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => boxRefs.current[0]?.focus(), 50);
    }
  };

  const handleReset = () => {
    setStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
  };

  const handleResend = async () => {
    setError('');
    setOtpDigits(['', '', '', '', '', '']);
    setLoading(true);
    const res = await sendOtp(mobile);
    setLoading(false);
    if (res.success) {
      setTimeout(() => boxRefs.current[0]?.focus(), 100);
    } else {
      setError(res.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const otp = otpDigits.join('');

  return (
    <div className="otp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="otp-modal">
        {/* Header */}
        <div className="otp-header">
          <button className="otp-close" onClick={onClose}>✕</button>
          <div className="otp-brand">
            <div className="otp-brand-dot" />
            <span className="otp-brand-name">hogaa</span>
            <div className="otp-brand-dot" />
          </div>
          <h2 className="otp-header-title">
            {step === 1 ? 'Sign In / Sign Up' : 'Verify OTP'}
          </h2>
          <p className="otp-header-sub">
            {step === 1
              ? 'Enter your mobile to continue shopping'
              : `OTP sent to +91 ${mobile}`}
          </p>
        </div>

        {/* Body */}
        <div className="otp-body">
          {/* Steps */}
          <div className="otp-steps">
            <div className={`otp-step-item ${step === 1 ? 'active' : 'done'}`}>
              <div className="otp-step-circle">{step > 1 ? '✓' : '1'}</div>
              <span className="otp-step-label">Mobile</span>
            </div>
            <div className={`otp-step-line ${step === 2 ? 'active' : ''}`} />
            <div className={`otp-step-item ${step === 2 ? 'active' : ''}`}>
              <div className="otp-step-circle">2</div>
              <span className="otp-step-label">Verify</span>
            </div>
          </div>

          {/* Step 1: Mobile */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <label className="otp-field-label">Mobile Number</label>
              <div className="otp-phone-row">
                <div className="otp-country">
                  <span className="otp-flag">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="otp-mobile-input"
                  type="tel"
                  className="otp-phone-input"
                  placeholder="Enter 10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
              {error && <div className="otp-error">⚠ {error}</div>}
              <button type="submit" className="otp-submit-btn" disabled={loading || mobile.length !== 10}>
                {loading ? <><span className="otp-spinner" /> Sending OTP...</> : <>Send OTP →</>}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerify}>
              <div className="otp-mobile-display">
                <span>📱</span>
                <span className="otp-mobile-number">+91 {mobile}</span>
              </div>

              <label className="otp-field-label">Enter OTP</label>
              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (boxRefs.current[i] = el)}
                    type="tel"
                    className={`otp-box ${d ? 'filled' : ''}`}
                    value={d}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>

              {error && <div className="otp-error">⚠ {error}</div>}

              <button
                type="submit"
                className="otp-submit-btn"
                disabled={loading || otp.length !== 6}
              >
                {loading ? <><span className="otp-spinner" /> Verifying...</> : <>Verify & Continue →</>}
              </button>

              <div className="otp-footer">
                <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                  Resend OTP
                </button>
                <span className="otp-footer-divider">•</span>
                <button type="button" className="otp-back-btn" onClick={handleReset}>
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trust */}
        <div className="otp-trust">
          <div className="otp-trust-item">🔒 <span>Secure Login</span></div>
          <div className="otp-trust-item">✓ <span>No Password</span></div>
          <div className="otp-trust-item">⚡ <span>Instant Access</span></div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
