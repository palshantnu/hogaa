import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppPromotion.css';

import promoImg1 from '../assets/photo/4.jpeg';
import promoImg2 from '../assets/photo/5.png';
import promoImg3 from '../assets/photo/6.png';

const AppPromotion = () => {
  const navigate = useNavigate();

  return (
    <section className="app-promo-container">
      <div className="app-promo-inner">
        {/* Left – text content */}
        <div className="app-promo-content">
          <div className="promo-badge">✨ LIMITED TIME OFFER</div>
          <h2 className="promo-main-title">
            Shop smarter with <span className="highlight hogaa-font">hogaa</span>
          </h2>
          <p className="promo-description">
            Experience beauty at your fingertips. Get exclusive early access to new launches,
            personalized makeup recommendations, and app-only discounts. Your perfect
            look is just a tap away.
          </p>

          <div className="promo-features">
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span>Early Access</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💎</span>
              <span>Exclusive Discounts</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎁</span>
              <span>Free Gifts</span>
            </div>
          </div>

          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/collections/lips')}>Shop Now →</button>
            <button className="cta-secondary" onClick={() => navigate('/collections/face')}>Explore Collections</button>
          </div>
        </div>

        {/* Right – image collage */}
        <div className="app-promo-images">
          <div className="promo-img-col promo-img-col--tall">
            <img src={promoImg1} alt="hogaa Collection" loading="lazy" />
          </div>
          <div className="promo-img-col promo-img-col--stack">
            <img src={promoImg2} alt="hogaa Makeup" loading="lazy" />
            <img src={promoImg3} alt="hogaa Beauty" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;
