const DEFAULT_MESSAGES = [
  "Enjoy up to 10% off on orders above ₹1199",
  "Free shipping on orders above ₹499",
  "Flat 20% OFF | Use Code: hogaa20",
];

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Navbar.css";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  Heart,
  LogOut,
  UserCircle,
  Package,
  X,
} from "lucide-react";

import { getWishlist } from "../utils/wishlist";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/logo.jpeg";


const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [marqueeMessages, setMarqueeMessages] = useState(DEFAULT_MESSAGES);
  const marqueeRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const data = getWishlist();
    setWishlistCount(data.length);
  }, []);

  useEffect(() => {
    fetch('https://admin.hogaacosmetics.com/api/settings/marquee')
      .then(r => r.json())
      .then(d => { if (d.success && d.messages?.length) setMarqueeMessages(d.messages); })
      .catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const fetchSuggestions = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://admin.hogaacosmetics.com/api/products?search=${encodeURIComponent(q)}&show_variations=true`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          setSearchResults((data.products || []).slice(0, 6));
          setShowDropdown(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowDropdown(false);
    setSearchQuery("");
    setMobileSearchOpen(false);
    navigate(product.slug ? `/product/${product.slug}` : `/product/${product.id}`);
  };

  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const img = product.images[0];
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/")) return `https://admin.hogaacosmetics.com${img}`;
    return `https://admin.hogaacosmetics.com/uploads/products/${img}`;
  };

  const getStoredUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // Fetch cart count — works for both logged-in and guest users
  const fetchCartCount = async () => {
    try {
      const userId = user?.id || getStoredUser()?.id;
      if (!userId) {
        // guest cart from localStorage
        try {
          const g = JSON.parse(localStorage.getItem('guest_cart') || '[]');
          setCartCount(g.reduce((s, i) => s + i.quantity, 0));
        } catch { setCartCount(0); }
        return;
      }
      const response = await fetch(`https://admin.hogaacosmetics.com/api/cart/count?user_id=${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) setCartCount(data.count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Call it in useEffect
  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  // Marquee animation
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationId;
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      position -= speed;

      const firstChild = marquee.children[0];
      if (firstChild && Math.abs(position) >= firstChild.offsetWidth) {
        position = 0;
        marquee.appendChild(firstChild.cloneNode(true));
        marquee.removeChild(firstChild);
      }

      marquee.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    setShowUserDropdown(false);
    navigate('/profile');
  };

  // Handle orders navigation
  const handleOrdersClick = () => {
    setShowUserDropdown(false);
    navigate('/profile', { state: { activeTab: 'orders' } });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="mobile-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* MOBILE SIDEBAR */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-header">
          <img src={logoIcon} alt="logo" className="mobile-menu-logo" />
          <X size={24} onClick={() => setIsOpen(false)} style={{ cursor: "pointer" }} />
        </div>

        {/* Bottom links */}
        <div className="mobile-bottom-links">
          <Link to="/offers" onClick={() => setIsOpen(false)}>Offers</Link>
          <Link to="/wishlist" onClick={() => setIsOpen(false)}>Wishlist</Link>
          {user ? (
            <button className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="mobile-logout-btn" onClick={() => { setIsOpen(false); openAuthModal(); }}>Login</button>
          )}
        </div>
      </div>

      {/* TOP BAR - Marquee style */}
      <div className="top-bar-marquee">
        <div className="marquee-container">
          <div className="marquee-content" ref={marqueeRef}>
            {marqueeMessages.map((msg, idx) => (
              <span key={idx} className="marquee-message">
                {msg} &nbsp;&nbsp;★&nbsp;&nbsp;
              </span>
            ))}
            {marqueeMessages.map((msg, idx) => (
              <span key={`dup-${idx}`} className="marquee-message">
                {msg} &nbsp;&nbsp;★&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav className="sugar-nav">
        <div className="nav-main-container">
          {/* LEFT */}
          <div className="left-section">
            <div className="hamburger" onClick={() => setIsOpen(true)}>
              <Menu size={24} />
            </div>

            <div className="brand-section" onClick={() => navigate('/')}>
              <img src={logoIcon} alt="logo" className="brand-logo-img" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="nav-right-tools">
            {/* Desktop Search */}
            <form className="search-bar" onSubmit={handleSearchSubmit} ref={searchRef} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
              />
              {searchQuery ? (
                <button type="button" className="nav-search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}>
                  <X size={14} />
                </button>
              ) : (
                <Search size={18} style={{ cursor: "pointer" }} onClick={handleSearchSubmit} />
              )}

              {/* Suggestions Dropdown */}
              {showDropdown && (
                <div className="nav-search-dropdown">
                  {isSearching && <div className="nav-search-loading">Searching...</div>}
                  {!isSearching && searchResults.length === 0 && (
                    <div className="nav-search-empty">No results for "{searchQuery}"</div>
                  )}
                  {!isSearching && searchResults.map((product) => (
                    <div key={product.id} className="nav-search-item" onClick={() => handleSuggestionClick(product)}>
                      <div className="nav-search-item-img">
                        {getProductImage(product) ? (
                          <img src={getProductImage(product)} alt={product.name} />
                        ) : (
                          <div className="nav-search-no-img" />
                        )}
                      </div>
                      <div className="nav-search-item-info">
                        <span className="nav-search-item-name">{product.name}</span>
                        <span className="nav-search-item-price">
                          {product.display_price || (product.price && `₹${parseFloat(product.price).toLocaleString("en-IN")}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!isSearching && searchResults.length > 0 && (
                    <button className="nav-search-view-all" onClick={handleSearchSubmit}>
                      View all results for "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Mobile Search Icon */}
            <div className="mobile-search" onClick={() => setMobileSearchOpen(true)}>
              <Search size={22} />
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
              <div className="mobile-search-overlay" ref={searchRef}>
                <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
                  <div className="mobile-search-input-wrap">
                    <Search size={16} color="#666" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                    />
                    {searchQuery && (
                      <button type="button" className="nav-search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button type="button" className="mobile-search-cancel" onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>
                    Cancel
                  </button>
                </form>
                {isSearching && <div className="mob-search-loading">Searching...</div>}
                {!isSearching && searchResults.length > 0 && (
                  <div className="mob-search-results">
                    {searchResults.map((product) => (
                      <div key={product.id} className="nav-search-item" onClick={() => handleSuggestionClick(product)}>
                        <div className="nav-search-item-img">
                          {getProductImage(product) ? (
                            <img src={getProductImage(product)} alt={product.name} />
                          ) : <div className="nav-search-no-img" />}
                        </div>
                        <div className="nav-search-item-info">
                          <span className="nav-search-item-name">{product.name}</span>
                          <span className="nav-search-item-price">
                            {product.display_price || (product.price && `₹${parseFloat(product.price).toLocaleString("en-IN")}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="nav-search-view-all" onClick={handleSearchSubmit}>
                      View all results
                    </button>
                  </div>
                )}
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="mob-search-loading">No results for "{searchQuery}"</div>
                )}
              </div>
            )}

            {/* User Section - Conditional Rendering */}
            {user ? (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  className="user-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <User size={22} />
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>

                    <button className="user-dropdown-item" onClick={handleProfileClick}>
                      <UserCircle size={18} />
                      <span>My Profile</span>
                    </button>

                    <button className="user-dropdown-item" onClick={handleOrdersClick}>
                      <Package size={18} />
                      <span>My Orders</span>
                    </button>

                    <div className="user-dropdown-divider"></div>

                    <button className="user-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-link-icon auth-link nav-login-btn" onClick={() => openAuthModal()}>
                <User size={22} />
                <span className="auth-text">Login</span>
              </button>
            )}

            <Link to="/cart" className="nav-link-icon cart-wrapper">
              <ShoppingCart size={22} />
              <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;