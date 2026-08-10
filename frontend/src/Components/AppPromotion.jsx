import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppPromotion.css';

import promoImg1 from '../assets/photo/4.jpeg';
import promoImg2 from '../assets/photo/5.png';
import promoImg3 from '../assets/photo/6.png';

const API_BASE = 'https://admin.hogaacosmetics.com';

const DEFAULT_PROMO = {
  badge: '✨ LIMITED TIME OFFER',
  title: 'Shop smarter with',
  titleHighlight: 'hogaa',
  description: 'Experience beauty at your fingertips. Get exclusive early access to new launches, personalized makeup recommendations, and app-only discounts. Your perfect look is just a tap away.',
  features: [
    { icon: '🚀', label: 'Early Access' },
    { icon: '💎', label: 'Exclusive Discounts' },
    { icon: '🎁', label: 'Free Gifts' }
  ],
  ctaPrimary: { text: 'Shop Now →', link: '/collections/lips' },
  ctaSecondary: { text: 'Explore Collections', link: '/collections/face' },
  images: { tall: null, stack1: null, stack2: null }
};

const AppPromotion = () => {
  const navigate = useNavigate();
  const [promo, setPromo] = useState(DEFAULT_PROMO);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/app-promo`);
        const data = await response.json();
        if (data.success && data.promo) {
          setPromo(data.promo);
        }
      } catch (error) {
        console.error('Error fetching promo section:', error);
      }
    };

    fetchPromo();
  }, []);

  const resolveImage = (url, fallback) => (url ? `${API_BASE}${url}` : fallback);

  return (
    <section className="app-promo-container">
      <div className="app-promo-inner">
        {/* Left – text content */}
        <div className="app-promo-content">
          <div className="promo-badge">{promo.badge}</div>
          <h2 className="promo-main-title">
            {promo.title} <span className="highlight hogaa-font">{promo.titleHighlight}</span>
          </h2>
          <p className="promo-description">
            {promo.description}
          </p>

          <div className="promo-features">
            {promo.features.map((feature, index) => (
              <div className="feature-item" key={index}>
                <span className="feature-icon">{feature.icon}</span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate(promo.ctaPrimary.link)}>{promo.ctaPrimary.text}</button>
            <button className="cta-secondary" onClick={() => navigate(promo.ctaSecondary.link)}>{promo.ctaSecondary.text}</button>
          </div>
        </div>

        {/* Right – image collage */}
        <div className="app-promo-images">
          <div className="promo-img-col promo-img-col--tall">
            <img src={resolveImage(promo.images.tall, promoImg1)} alt="hogaa Collection" loading="lazy" />
          </div>
          <div className="promo-img-col promo-img-col--stack">
            <img src={resolveImage(promo.images.stack1, promoImg2)} alt="hogaa Makeup" loading="lazy" />
            <img src={resolveImage(promo.images.stack2, promoImg3)} alt="hogaa Beauty" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;
