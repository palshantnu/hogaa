import React, { useRef } from "react";
import "./Shop.css";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";

import mascara2 from "../assets/mascara2.avif";
import liner3 from "../assets/liner3.jpg";
import skincare from "../assets/skincare.png";
import eyeshadow1 from "../assets/eyeshadow1.webp";
import nailpaint2 from "../assets/nailpaint2.webp";
const products = [
  { id: 1, name: "Lip Gloss", price: 399, oldPrice: 599, rating: 4.6, img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400" },
  { id: 2, name: "Nailpaint", price: 449, oldPrice: 699, rating: 4.4, img: nailpaint2 },
  { id: 3, name: "Eyeliner", price: 299, oldPrice: 499, rating: 4.7, img: liner3 },
  { id: 4, name: "Serum", price: 499, oldPrice: 799, rating: 4.9, img: skincare },
  { id: 5, name: "Blush", price: 399, oldPrice: 599, rating: 4.5, img: eyeshadow1 },
  { id: 6, name: "Mascara", price: 349, oldPrice: 549, rating: 4.6, img: mascara2 },
  { id: 7, name: "Primer", price: 459, oldPrice: 699, rating: 4.3, img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400" },
  { id: 8, name: "Highlighter", price: 499, oldPrice: 799, rating: 4.8, img: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400" },
];

const Shop = () => {
  const navigate = useNavigate();
  const scrollRef = useRef();

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="arrival-container">

      {/* 🔥 HEADER WITH ARROWS */}
      <div className="arrival-header">
        <h2>Just Arrived</h2>

        <div className="arrow-group">
          <button onClick={scrollLeft}>‹</button>
          <button onClick={scrollRight}>›</button>
        </div>
      </div>

      {/* SCROLL */}
      <div className="scroll-container" ref={scrollRef}>
        {products.map((item) => (
          <div className="arrival-card" key={item.id} onClick={() =>
            navigate(`/product/${item.id}`, { state: item })

          }>
            <div className="arrival-img">
              <img src={item.img} alt={item.name} />
              {/* <span className="wishlist">♡</span> */}
            </div>

            <h3>{item.name}</h3>
            <div className="rating">{item.rating} ★</div>

            <div className="price">
              ₹{item.price}
              <span>₹{item.oldPrice}</span>
              <p>20% OFF</p>
            </div>

            <button className="cart-btn" onClick={(e) => {
              e.stopPropagation();
              addToCart(item, 1);
              alert("Added to cart ✅");
            }}>ADD TO BAG</button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Shop;