import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="hogga-newsletter-section">
      <div className="hogga-newsletter-card">
        {/* Left Side: Content */}
        <div className="hogga-newsletter-left">
          <h2 className="hogga-discount-text">
            Get <span className="hogga-gold">25% Discount</span> on your first purchase
          </h2>
          <p className="hogga-newsletter-desc">
            Join the <span className="hogaa-font">hogaa</span> beauty community. Subscribe to get exclusive makeup tips,
            new launch alerts, and special offers directly to your inbox.
          </p>
        </div>

        {/* Right Side: Form */}
        {/* <div className="hogga-newsletter-right">
          <form className="hogga-form" onSubmit={(e) => e.preventDefault()}>
            <div className="hogga-input-field">
              <label>Name</label>
              <input type="text" placeholder="Your Name" required />
            </div>
            
            <div className="hogga-input-field">
              <label>Email</label>
              <input type="email" placeholder="abc@mail.com" required />
            </div>

            <div className="hogga-checkbox-wrapper">
              <input type="checkbox" id="news-check" />
              <label htmlFor="news-check">Subscribe to the newsletter</label>
            </div>

            <button type="submit" className="hogga-submit-btn">Submit</button>
          </form>
        </div> */}
      </div>
    </section>
  );
};

export default Newsletter;