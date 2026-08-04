import React, { useState, useEffect } from "react";
import ScrollReveal from "scrollreveal";
import "./Lips.css";
<button className="wishlist-btn">♡</button>
import lipbanner from "../assets/lipstickbanner.png";
import lipstick1 from "../assets/listick1.jpg";


const lipsData = [
  {
    id: 1,
    name: "Matte Lipstick",
    desc: "Rich pigment with long-lasting matte finish.",
    price: 599,
    oldPrice: 799,
    discount: "25% OFF",
    rating: 4.8,
    reviews: 120,
    image: lipstick1,
    colors: ["#B74C4B", "#CC2E2D", "#C63F7B"]
  },
  {
    id: 2,
    name: "Glossy Lipstick",
    desc: "Shiny glossy finish for hydrated lips.",
    price: 499,
    oldPrice: 699,
    discount: "28% OFF",
    rating: 4.6,
    reviews: 95,
    image: lipstick1,
    colors: ["#E94E77", "#D7263D"]
  },
  {
    id: 3,
    name: "Liquid Lipstick",
    desc: "Transfer-proof liquid matte lipstick.",
    price: 699,
    oldPrice: 899,
    discount: "22% OFF",
    rating: 4.9,
    reviews: 150,
    image: lipstick1,
    colors: ["#8B0000", "#FF4D6D"]
  },
  {
    id: 4,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 5,
    name: "Lip Balm",
    desc: "Hydrating balm for soft lips.",
    price: 299,
    oldPrice: 399,
    discount: "20% OFF",
    rating: 4.4,
    reviews: 60,
    image: lipstick1,
    size: "10g"
  },
  {
    id: 6,
    name: "Lip Crayon",
    desc: "Smooth application with intense color.",
    price: 549,
    oldPrice: 749,
    discount: "27% OFF",
    rating: 4.7,
    reviews: 110,
    image: lipstick1,
    colors: ["#A52A2A", "#C04000"]
  },
  {
    id: 7,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 8,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 9,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 10,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 11,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },{
    id: 12,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  },
  {
    id: 13,
    name: "Lip Tint",
    desc: "Natural tint for everyday look.",
    price: 399,
    oldPrice: 599,
    discount: "30% OFF",
    rating: 4.5,
    reviews: 80,
    image: lipstick1,
    colors: ["#FF6F61", "#FFB6C1"]
  }
];
const Lips = () => {
  const [isSortOpen, setSortOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);

  const [openSection, setOpenSection] = useState("price");

  useEffect(() => {
    ScrollReveal().reveal(".card", {
      distance: "40px",
      origin: "bottom",
      duration: 800,
      interval: 100,
    });

  
  
  
  ScrollReveal().reveal(".hero-content", {
    origin: "left",
    distance: "80px",
    duration: 1000,
    delay: 200,
    easing: "ease-in-out",
    reset: false,
  });

  ScrollReveal().reveal(".hero", {
   origin: "right",
    distance: "100px",
    duration: 1200,
    delay: 200,
    easing: "ease-in-out",
    reset: false,
  });
}, 
  
  []);

  const images = Array(12).fill(lipstick1);

  return (
    <div className="lips-page">

      {/* HERO */}
     <div className="hero">
  <img src={lipbanner} alt="" />

  <div className="hero-content">
    <h1 className="hero-title">Unleash Your Lip Power</h1>
    <p className="hero-subtitle">
      Discover bold shades, smooth finish & long-lasting beauty
    </p>
    <button className="hero-btn">Shop Now</button>
  </div>
</div>

      {/* MOBILE BAR */}
      <div className="mobile-bar">
        <div onClick={() => setFilterOpen(true)}>Filter</div>
        <div onClick={() => setSortOpen(true)}>Sort By ⌄</div>
      </div>

      {/* DESKTOP SORT */}
      <div className="desktop-sort" onClick={() => setSortOpen(true)}>
        SORT BY ⌄
      </div>

      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          {/* PRICE */}
          <div className="filter-block">
            <div
              className="filter-head"
              onClick={() =>
                setOpenSection(openSection === "price" ? null : "price")
              }
            >
              PRICE <span>⌄</span>
            </div>

            {openSection === "price" && (
              <div className="filter-content">
                <label><input type="radio" name="price" /> Under ₹499</label>
                <label><input type="radio" name="price" /> ₹500 - ₹999</label>
                <label><input type="radio" name="price" /> ₹1000 - ₹1499</label>
                <label><input type="radio" name="price" /> Above ₹1500</label>
              </div>
            )}
          </div>

          {/* COVERAGE */}
          <div className="filter-block">
            <div
              className="filter-head"
              onClick={() =>
                setOpenSection(openSection === "coverage" ? null : "coverage")
              }
            >
              COVERAGE <span>⌄</span>
            </div>

            {openSection === "coverage" && (
              <div className="filter-content">
                <label><input type="checkbox" /> Sheer</label>
                <label><input type="checkbox" /> Medium</label>
                <label><input type="checkbox" /> Full</label>
              </div>
            )}
          </div>

          {/* FINISH */}
          <div className="filter-block">
            <div
              className="filter-head"
              onClick={() =>
                setOpenSection(openSection === "finish" ? null : "finish")
              }
            >
              FINISH <span>⌄</span>
            </div>

            {openSection === "finish" && (
              <div className="filter-content">
                <label><input type="checkbox" /> Matte</label>
                <label><input type="checkbox" /> Glossy</label>
                <label><input type="checkbox" /> Satin</label>
                <label><input type="checkbox" /> Cream</label>
              </div>
            )}
          </div>

          {/* COLOR */}
          <div className="filter-block">
            <div
              className="filter-head"
              onClick={() =>
                setOpenSection(openSection === "color" ? null : "color")
              }
            >
              COLOR <span>⌄</span>
            </div>

            {openSection === "color" && (
              <div className="filter-content">
                <label><input type="checkbox" /> Red</label>
                <label><input type="checkbox" /> Pink</label>
                <label><input type="checkbox" /> Nude</label>
                <label><input type="checkbox" /> Brown</label>
              </div>
            )}
          </div>

        </aside>

        {/* PRODUCTS */}
        <main className="products">
          <div className="grid">
  {lipsData.map((product) => (
    <div key={product.id} className="product-card">

      <div className="card-top-action">
        <span></span>
        <button className="wishlist-btn">♡</button>
      </div>

      <div className="image-container-placeholder">
        <img src={product.image} alt="" className="p-img"/>
      </div>

      <div className="product-info-box">

        <h3 className="p-name">{product.name}</h3>
        <p className="p-desc">{product.desc}</p>

        <div className="rating-row">
          <span>{product.rating}</span>
          <span>⭐</span>
          <span>({product.reviews})</span>
        </div>

        <div className="price-row">
          <span className="new-price">₹{product.price}</span>
          <span className="old-price">₹{product.oldPrice}</span>
          <span className="discount">{product.discount}</span>
        </div>

        {/* COLORS OR SIZE */}
        {product.colors ? (
          <div className="dots">
            {product.colors.map((c, i) => (
              <span key={i} className="dot" style={{ background: c }}></span>
            ))}
            <span className="spacer"></span>
            <span className="dot plus">+</span>
          </div>
        ) : (
          <span className="size">{product.size}</span>
        )}

        <button className="add-bag-btn">ADD TO BAG</button>

      </div>
    </div>
  ))}
</div>
        </main>

      </div>

      {/* SORT */}
      {isSortOpen && (
        <div className="overlay" onClick={() => setSortOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <p>Low to High</p>
            <p>High to Low</p>
            <p>Newest First</p>
            <p>Best Selling</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lips;