import React, { useState } from "react";
import "./Skin.css";

const skinProducts = [
  {
    id: 1,
    name: "Hydrating Moisturizer",
    price: 499,
    available: true,
    img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9"
  },
  {
    id: 2,
    name: "SPF 50 Sunscreen",
    price: 399,
    available: true,
    img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273"
  },
  {
    id: 3,
    name: "Face Mist Spray",
    price: 299,
    available: false,
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc"
  },
  {
    id: 4,
    name: "Vitamin C Serum",
    price: 699,
    available: true,
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be"
  },
  {
    id: 5,
    name: "Clay Face Mask",
    price: 349,
    available: true,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
  },
  {
    id: 6,
    name: "Exfoliating Scrub",
    price: 259,
    available: false,
    img: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a"
  }
];

const Skin = () => {
  const [showAvailable, setShowAvailable] = useState(false);
  const [sort, setSort] = useState("");

  let filtered = [...skinProducts];

  if (showAvailable) {
    filtered = filtered.filter(p => p.available);
  }

  if (sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="skin-container">

      {/* HERO */}
      <div className="skin-hero">
        <img
          src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908"
          alt="skin banner"
        />
      </div>

      <div className="skin-content">

        {/* LEFT FILTER */}
        <div className="filter-section">
          <h3>Availability</h3>

          <label>
            <input
              type="checkbox"
              onChange={() => setShowAvailable(!showAvailable)}
            />
            In Stock Only
          </label>
        </div>

        {/* RIGHT */}
        <div className="products-section">

          {/* SORT */}
          <div className="sort-bar">
            <span>Sort By:</span>
            <select onChange={(e) => setSort(e.target.value)}>
              <option value="">Default</option>
              <option value="low">Price Low → High</option>
              <option value="high">Price High → Low</option>
            </select>
          </div>

          {/* PRODUCTS */}
          <div className="products-grid">
            {filtered.map(item => (
              <div className="product-card" key={item.id}>
                <img src={item.img} alt={item.name} />
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>

                <button className="cart-btn">
                  {item.available ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Skin;