import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../utils/wishlist";
import { addToCart } from "../utils/cart"; // Cart functionality bhi add ki hai
import "./Wishlist.css"; 
import heroImg from "../assets/wishlist1.jpg";
const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  const refreshWishlist = () => {
    setItems(getWishlist());
  };

  const handleMoveToCart = (item) => {
    addToCart(item); // Item cart mein bhejo
    removeFromWishlist(item.id); // Wishlist se hatao
    refreshWishlist();
    alert("Moved to Cart! 💄");
  };

  return (
    <>
        <div className="page-hero">
      <img src={heroImg} alt="hero" />
      <div className="hero-overlay">
        <h1>My Cart</h1>   {/* change according to page */}
      </div>
    </div>
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h2>MY WISHLIST <span>({items.length} Items)</span></h2>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <img src="https://cdn-icons-png.flaticon.com/512/10711/10711129.png" alt="empty" width="100"/>
          <p>Alas! Your wishlist is empty.</p>
          <button className="shop-btn">START SHOPPING</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item.id} className="wishlist-card">
              {/* Product Image & Remove Icon */}
              <div className="image-container">
                <img src={item.image} alt={item.name} />
                <button 
                  className="close-btn" 
                  onClick={() => { removeFromWishlist(item.id); refreshWishlist(); }}
                >
                  ✕
                </button>
              </div>

              {/* Product Info */}
              <div className="product-info">
                <h4 className="item-name">{item.name}</h4>
                <div className="price-box">
                  <span className="current-price">Rs. {item.price}</span>
                  {item.oldPrice && <span className="old-price">Rs. {item.oldPrice}</span>}
                </div>
                {item.discount && <p className="discount-text">({item.discount} OFF)</p>}
              </div>

              {/* Move to Cart Action */}
              <button className="move-to-cart" onClick={() => handleMoveToCart(item)}>
                MOVE TO CART
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default Wishlist;