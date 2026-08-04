import React from 'react';
import './Term.css';

const TermsConditions = () => {
  return (
    <div className="hogaa-policy-container">
      <header className="policy-header">
        <h1>Terms & Conditions</h1>
        <p className="last-updated">Last Updated: March 2026</p>
      </header>

      <div className="policy-content-wrapper">
        {/* Introduction */}
        <section className="policy-section">
          <h2>Introduction</h2>
          <p>
            The <span className="brand-name">hogaacosmetics.com</span> website ("Website") and hogaa Mobile Application ("App") 
            are internet-based content and e-commerce portals. Use of the Website and/or App is offered to you 
            conditioned on acceptance without modification of all the terms, conditions, and notices contained 
            in these Terms, as may be posted on the Website and/or App from time to time.
          </p>
          <p>
            hogaa Cosmetics at its sole discretion reserves the right not to accept a User from registering on 
            the Website and/or App without assigning any reason thereof. By using the services of hogaa, 
            you agree to be bound by these Terms & Conditions.
          </p>
        </section>

        {/* User Account, Password, and Security */}
        <section className="policy-section">
          <h2>User Account, Password, and Security</h2>
          <p>
            Use of the Site and/or App is available only to persons who can form legally binding contracts under 
            applicable law. Persons who are "incompetent to contract" within the meaning of the Indian Contract Act, 
            1872 are not eligible to use the Site.
          </p>
          <p>
            You will receive a username and password for your account upon completing the Website's registration 
            process. You are responsible for maintaining the confidentiality of the password and account, and are 
            fully responsible for all activities that occur under your password or account.
          </p>
        </section>

        {/* Prohibited Content & Behavior */}
        <section className="policy-section">
          <h2>Prohibited Content & Behavior</h2>
          <p>By using our website and/or App, you agree not to host, display, upload, modify, publish, or share any information that:</p>
          <ul className="policy-list">
            <li>Belongs to another person and to which the user does not have any right.</li>
            <li>Is harmful to minors, harassing, blasphemous, defamatory, or invasive of another's privacy.</li>
            <li>Infringes upon another person's copyright, trademark, patent or other proprietary rights.</li>
            <li>Impersonates another person or entity.</li>
            <li>Contains software viruses or any other computer code designed to interrupt or limit functionality.</li>
          </ul>
        </section>

        {/* Privacy Policy Integration */}
        <section className="policy-section">
          <h2>Privacy Policy</h2>
          <p>
            The User hereby consents, expresses and agrees that he has read and fully understands the Privacy Policy 
            of hogaa. The user further consents that the terms and contents of such Privacy Policy are acceptable to him. 
            We may employ third-party companies or individuals to process personal information on our behalf based 
            on our instructions.
          </p>
        </section>

        {/* Product Use & Services */}
        <section className="policy-section">
          <h2>Product use & services</h2>
          <p>
            The products and services available on the platform are for your personal and/or professional use only. 
            The products or samples thereof, which you may receive from us, shall not be sold or resold for any 
            commercial reasons.
          </p>
          <p className="special-note">
            It is advised that consumers with allergies should always read a product's ingredient statement before use.
          </p>
        </section>

        {/* Pricing and Offer Information */}
        <section className="policy-section">
          <h2>Pricing and offer information</h2>
          <p>
            hogaa Cosmetics strives to provide accurate product and pricing information, however errors may occur. 
            Prices and availability of the products and services provided or offered on the site and/or app are 
            subject to change without prior notice.
          </p>
          <ul className="policy-list">
            <li>Products offered as GWP (Gift with Purchase) are subjected to availability of exact variant.</li>
            <li>The company reserves the right to cancel any order if the product is listed at an incorrect price.</li>
            <li>Promotional codes are valid for a specific time period and cannot be clubbed unless stated otherwise.</li>
          </ul>
        </section>

        {/* Intellectual Property Rights */}
        <section className="policy-section">
          <h2>Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, hogaa owns all Intellectual Property Rights to and into the Website, 
            including, without limitation, any and all rights, title and interest in and to copyright, related 
            rights, patents, utility models, trademarks, trade names, service marks, designs, and trade secrets.
          </p>
        </section>

        <div className="final-note">
          <p>
            <span className="bold-text">Disclaimer:</span> hogaa reserves the right to update these terms at any 
            time without prior notice. Continued use of the platform constitutes your agreement to the updated terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;