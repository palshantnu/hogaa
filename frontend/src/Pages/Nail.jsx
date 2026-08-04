import React, { useState } from "react";
import "./Nail.css";

const nailProducts = [
  {
    id: 1,
    name: "Glossy Nail Polish",
    price: 199,
    available: true,
    img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad"
  },
  {
    id: 2,
    name: "Matte Nail Paint",
    price: 249,
    available: true,
    img: "https://images.unsplash.com/photo-1604654894610-df63bc536371"
  },
  {
    id: 3,
    name: "Nail Combo Kit",
    price: 499,
    available: false,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
  },
  {
    id: 4,
    name: "Glitter Nail Polish",
    price: 299,
    available: true,
    img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6"
  },
  {
    id: 5,
    name: "Nail Art Kit",
    price: 599,
    available: true,
    img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19"
  },
  {
    id: 6,
    name: "Gel Nail Polish",
    price: 399,
    available: false,
    img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd"
  }
];

const Nails = () => {
  const [showAvailable, setShowAvailable] = useState(false);
  const [sort, setSort] = useState("");

  let filtered = [...nailProducts];

  if (showAvailable) {
    filtered = filtered.filter(p => p.available);
  }

  if (sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="nails-container">

      {/* HERO */}
      <div className="nails-hero">
        <img
          src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66"
          alt="nails banner"
        />
      </div>

      <div className="nails-content">

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

export default Nails;