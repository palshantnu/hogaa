import React from 'react';
import './Return.css'; // Make sure to import the CSS file

const ReturnsRefunds = () => {
  return (
    <div className="hogaa-policy-container">
      {/* Centered Page Header */}
      <header className="policy-header">
        <h1>Returns & Refunds</h1>
        <p className="last-updated">Last Updated: October 26, 2023</p>
      </header>

      {/* Centered Content Wrapper */}
      <div className="policy-content-wrapper">
        
        {/* Section 1: Authenticity */}
        <section className="policy-section">
          <h2>Authenticity Guarantee</h2>
          <p>
            At <span className="brand-name">hogaacosmetics.com</span>, we ONLY stock authentic products. All our items are genuine and are sourced directly from the manufacturer or from their authorized distributors. Prior to shipping, we do several levels of rigorous quality checks, hence eliminating any chances of counterfeit products. If you have any concerns about the authenticity of any of the items you have purchased from us, please contact us directly by emailing us at <a href="mailto:hello@hogaacosmetics.com" className="contact-link">hello@hogaacosmetics.com</a> and we shall be happy to address your concerns.
          </p>
        </section>

        {/* Section 2: Returns */}
        <section className="policy-section">
          <h2>Returns policy for Full-Size Products</h2>
          <p>
            <span className="hogaa-font">hogaa</span>.com follows a transparent "No Questions Asked" returns policy for all full-size products bought from our online store. You can return the unused products you have ordered within 14 days of the date of receipt. Please note that used products cannot be returned. To return the unused goods, please email us at <a href="mailto:hello@hogaacosmetics.com" className="contact-link">hello@hogaacosmetics.com</a> and we will walk you through the process till completion.
          </p>
          <p className="special-note">
            Special instructions for Cosmetics: Products should not have been tried or used and the packaging should be intact.
          </p>
        </section>

        {/* Section 3: Refunds */}
        <section className="policy-section">
          <h2>Refunds Policy</h2>
          <p>
            Refunds are processed in a maximum of 15 days from the date on which hogaacosmetics.com receives returned goods. In case of prepaid order through Credit Card, Debit Card, or Net Banking, the amount will be refunded back to the account from which it was paid within 3-5 working days.
          </p>
          <p>
            In case of Cash-on-Delivery order, a refund transfer will be made for which certain details need to be provided over email (<a href="mailto:hello@hogaacosmetics.com" className="contact-link">hello@hogaacosmetics.com</a>). Please note that Cash-on-Delivery charges and Shipping Charges (if applicable) are not refundable.
          </p>
          <p>
            Products included in the Kit/Set/Combos are not eligible for returns or replacement. All Products under the 'Clearance Section' are not eligible for returns or replacement unless an item is received in a damaged/defective condition.
          </p>
        </section>

        {/* Section 4: Cancellation */}
        <section className="policy-section">
          <h2>Cancellation policy</h2>
          <p>
            An order can be cancelled only up to it is in "Pending" state. Once we start processing, it can not be cancelled. You will have to send us an email on <a href="mailto:hello@hogaacosmetics.com" className="contact-link">hello@hogaacosmetics.com</a> with reasons for the cancellation. Once you request the cancellation, it will take us a maximum of 1-2 business days to cancel the order.
          </p>
        </section>

        {/* Section 5: Contact & Address */}
        <section className="policy-section">
          <h2>Contact Us</h2>
          <div className="contact-address">
            <p className="company-name">MTL Solutions</p>
            <p>F-507, T-10,</p>
            <p>L&T Emerald Isles, Powai,</p>
            <p>Mumbai, Maharashtra</p>
            <p>PIN: 400072</p>
            <div className="contact-person">
              <p><span className="bold-text">Contact Person:</span> Manmeet Dhanjal</p>
              <p><span className="bold-text">Mobile:</span> <a href="tel:+917208812112" className="contact-link">+91 7208812112</a></p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="final-note">
          <p>
            <span className="bold-text">Note:</span> Any single product in the kit/set cannot be replaced or returned.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReturnsRefunds;