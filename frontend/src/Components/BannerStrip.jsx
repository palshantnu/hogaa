import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerStrip.css';

import strip1 from '../assets/photo/11.jpeg';
import strip2 from '../assets/photo/12.jpeg';
import strip3 from '../assets/photo/13.jpeg';

const strips = [
  { id: 1, src: strip1, label: 'New Launches', sub: 'Fresh arrivals every week', link: '/collections/lips' },
  { id: 2, src: strip2, label: 'Bestsellers', sub: 'Most loved by our customers', link: '/collections/face' },
  { id: 3, src: strip3, label: 'Trending Now', sub: 'What everyone is talking about', link: '/collections/eyes' },
];

const BannerStrip = () => {
  const navigate = useNavigate();

  return (
    <section className="banner-strip-section">
      {strips.map((item) => (
        <div
          key={item.id}
          className="banner-strip-card"
          onClick={() => navigate(item.link)}
        >
          <img src={item.src} alt={item.label} loading="lazy" />
          <div className="banner-strip-overlay">
            <p className="banner-strip-sub">{item.sub}</p>
            <h3 className="banner-strip-label">{item.label}</h3>
            <span className="banner-strip-btn">Shop Now →</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default BannerStrip;
