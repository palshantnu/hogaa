import React from 'react';
import { MapPin, Phone, Clock, Search, Navigation } from 'lucide-react';
import './Store.css';

const StoreLocator = () => {
  return (
    <div className="hogaa-store-container">
      <div className="store-wrapper">
        
        {/* Left Side: Store Details & Search */}
        <div className="store-info-panel">
          
          {/* Search Bar matching the screenshot */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Enter address or zip code.." />
              <Navigation className="gps-icon" size={18} />
            </div>
            <div className="distance-filter">
              {/* <span>20 KM</span> */}
              {/* <span className="dropdown-arrow">▼</span> */}
            </div>
          </div>

          {/* Store Card Details */}
          <div className="store-details-card">
            <h2 className="store-title">
              MTL Solutions — hogaa Cosmetics (Powai, Mumbai)
            </h2>

            <p className="store-address">
              F-507, T-10, L&T Emerald Isles, Powai, <br />
              Mumbai, Maharashtra — PIN: 400072
            </p>

            <div className="store-meta-info">
              <div className="meta-row">
                <Phone size={14} />
                <a href="tel:+917208812112" style={{ textDecoration: 'none', color: 'inherit' }}>+91 7208812112</a>
              </div>
              
              <div className="meta-row status-closed">
                <div className="status-dot"></div>
                <span>Open</span>
              </div>

              {/* <div className="distance-tag">
                1.20 kilometers away
              </div> */}
            </div>
          </div>
        </div>

        {/* Right Side: Map View */}
        <div className="store-map-panel">
          {/* Yahan aap Google Maps ka iframe ya library use kar sakte hain */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.4836951197!2d72.9056!3d19.1176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c85b90b9f9db%3A0x1a4a4a4a4a4a4a4a!2sL%26T%20Emerald%20Isle%2C%20Powai%2C%20Mumbai%2C%20Maharashtra%20400072!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export default StoreLocator;