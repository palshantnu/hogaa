import React, { useState, useEffect } from 'react';
import './Footer.css';
import { Link } from "react-router-dom";
import { getActivePages } from '../utils/pageApi';
import logoIcon from "../assets/logo.jpeg";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaGift, 
  FaChevronRight,
  FaNewspaper,
  FaUserCircle,
  FaShoppingBag,
  FaHeart,
  FaUndo,
  FaLock
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { IoLocationOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5';

const Footer = () => {
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static pages that should always be in quick links
  const staticPages = [
    { title: 'About Us', slug: 'about', icon: <FaNewspaper /> },
    { title: 'Contact Us', slug: 'contact', icon: <FaEnvelope /> },
    { title: 'Store Locator', slug: 'store', icon: <IoLocationOutline /> },
    { title: 'Return Policy', slug: 'return', icon: <FaUndo /> },
    { title: 'Terms & Conditions', slug: 'terms-conditions', icon: <FaLock /> },
    { title: 'Privacy Policy', slug: 'privacy-policy', icon: <MdSecurity /> },
    { title: 'FAQs', slug: 'faq', icon: <FaNewspaper /> }
  ];

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pages = await getActivePages();
        const customPages = pages.filter(page => 
          !staticPages.some(sp => sp.slug === page.slug)
        );
        setQuickLinks([...staticPages, ...customPages]);
      } catch (error) {
        console.error('Error fetching pages:', error);
        setQuickLinks(staticPages);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const getRoutePath = (slug) => {
    const specialRoutes = {
      'store': '/store',
      'contact': '/contact',
      'about': '/about',
      'return': '/return',
      'faq': '/faq',
      'terms-conditions': '/terms-conditions',
      'privacy-policy': '/privacy-policy'
    };
    return specialRoutes[slug] || `/page/${slug}`;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="hogaa-footer">
      {/* <div className="footer-wave-top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60">
          <path fill="#1a1a2e" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,37.3C672,32,768,32,864,37.3C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div> */}

      <div className="footer-main">
        <div className="footer-container">
          {/* Section 1: Brand Section */}
          <div className="footer-section brand-section">
            <div className="footer-logo">
              <img src={logoIcon} alt="hogaa Cosmetics" className="brand-logo-img" />
              {/* <span className="logo-text">hogaa</span> */}
            </div>
            <p className="brand-description">
              Premium quality cosmetics for the modern woman. 
              Discover beauty that speaks for itself.
            </p>
            <div className="newsletter-box">
              <h5>Subscribe to our newsletter</h5>
              <div className="newsletter-input">
                <input type="email" placeholder="Your email address" />
                <button type="button">→</button>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="footer-section links-section">
            <h4 className="footer-heading">QUICK LINKS</h4>
            <ul className="footer-links two-columns">
              {!loading && quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={getRoutePath(link.slug)}>
                    <FaChevronRight className="link-icon" />
                    {link.title}
                  </Link>
                </li>
              ))}
              {loading && (
                <>
                  <li><Link to="/about"><FaChevronRight />About Us</Link></li>
                  <li><Link to="/contact"><FaChevronRight />Contact Us</Link></li>
                  <li><Link to="/return"><FaChevronRight />Return Policy</Link></li>
                  <li><Link to="/faq"><FaChevronRight />FAQs</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Section 3: Contact & Account */}
          <div className="footer-section contact-section">
            <h4 className="footer-heading">CONTACT US</h4>
            <ul className="contact-list">
              <li>
                <IoMailOutline className="contact-icon" />
                <a href="mailto:hello@hogaacosmetics.com">hello@hogaacosmetics.com</a>
              </li>
              <li>
                <IoCallOutline className="contact-icon" />
                <a href="tel:+917208812112">+91 7208812112</a>
              </li>
              <li>
                <IoLocationOutline className="contact-icon" />
                <span>
                  MTL Solutions<br />
                  F-507, T-10, L&T Emerald Isles, Powai,<br />
                  Mumbai, Maharashtra — PIN: 400072
                </span>
              </li>
            </ul>

            <div className="account-links">
              <h4 className="footer-heading">MY ACCOUNT</h4>
              <ul className="footer-links">
                <li><Link to="/profile"><FaUserCircle /> My Profile</Link></li>
                <li><Link to="/profile" state={{ activeTab: 'orders' }}><FaShoppingBag /> My Orders</Link></li>
                
                <li><Link to="/return"><FaUndo /> Returns</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Bar */}
      <div className="social-bar">
        <div className="social-container">
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link fb">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link ig">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link yt">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="bottom-container">
          <div className="copyright">
            <FaGift className="gift-icon" />
            <p>© {currentYear} hogaa COSMETICS. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-conditions">Terms of Use</Link>
            <Link to="/return">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;