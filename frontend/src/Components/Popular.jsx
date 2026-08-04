import React, { useEffect, useRef } from "react";
import ScrollReveal from "scrollreveal";
import "./Popular.css";
import { useNavigate } from "react-router-dom";
import combo1 from '../assets/combo1.webp';
import combo2 from '../assets/combo2.jpg';
import lipstick4 from '../assets/lipstick4.jpg';
import { addToCart } from "../utils/cart";
import { addToWishlist } from "../utils/wishlist";
import { Heart } from "lucide-react";
const PopularSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef();

  useEffect(() => {
    ScrollReveal().reveal(".popular-card", {
      duration: 1000,
      distance: "60px",
      origin: "bottom",
      interval: 120,
    });
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  const products = [
    {
      img: combo1,
      name: "hogaa Velvet Lipstick",
      price: "₹990",
    },
    {
      img: combo2,
      name: "hogaa Matte Foundation",
      price: "₹549",
    },
    {
      img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
      name: "hogaa Nail Color Pro",
      price: "₹687",
    },
    {
      img: lipstick4,
      name: "hogaa Glow Serum",
      price: "₹1000",
    },
    {
      img: combo2,
      name: "hogaa Lip Gloss",
      price: "₹475",
    },
    {
      img: combo1,
      name: "hogaa Liquid Lipstick",
      price: "₹595",
    },
    {
      img: combo2,
      name: "hogaa Makeup Kit",
      price: "₹349",
    },
    {
      img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
      name: "hogaa Nail Kit",
      price: "₹1999",
    },
  ];

  return (
    <section className="popular-section">
      <div className="popular-header">
        <h2>Most Popular Products</h2>

        <div className="controls">
          <button onClick={scrollLeft}>‹</button>
          <button onClick={scrollRight}>›</button>
        </div>
      </div>

      <div className="popular-scroll" ref={scrollRef}>
        {products.map((item, index) => (
          <div className="popular-card" key={index}

            onClick={() =>
              navigate(`/product/${item.id}`, { state: item })
            }

          >

            <div className="popular-img-box">
              <img src={item.img} alt={item.name} />
              {/* <button
                className="wishlist-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToWishlist(item);
                  alert("Added to wishlist ❤️");
                }}
              >
                <Heart size={18} />
              </button> */}
            </div>

            <div className="popular-content">
              <h3>{item.name}</h3>
              <p className="rating">1 UNIT ⭐ 4.5</p>
              <h4>{item.price}</h4>

              {/* <div className="qty">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div> */}
            </div>

            <button className="add-btn" onClick={(e) => {
              e.stopPropagation();
              addToCart(item, 1);
              alert("Added to cart ✅");
            }}>ADD TO CART</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularSection;