import React, { useState } from "react";
import "./Face.css";

const productsData = [
  {
    id: 1,
    name: "Matte Foundation",
    price: 499,
    category: "Foundation",
    available: true,
    img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6"
  },
  {
    id: 2,
    name: "Compact Powder",
    price: 299,
    category: "Compact",
    available: true,
    img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd"
  },
  {
    id: 3,
    name: "Liquid Concealer",
    price: 349,
    category: "Concealer",
    available: false,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
  },
  {
    id: 4,
    name: "Blush Palette",
    price: 599,
    category: "Blush",
    available: true,
    img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19"
  },
  {
    id: 5,
    name: "Primer Base",
    price: 399,
    category: "Primer",
    available: true,
    img: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a"
  },
  {
    id: 6,
    name: "Contour Kit",
    price: 699,
    category: "Contour",
    available: false,
    img: "https://images.unsplash.com/photo-1583001809999-9d3f4c1c13f2"
  }
];

const Face = () => {
  const [showAvailable, setShowAvailable] = useState(false);
  const [sort, setSort] = useState("");

  let filteredProducts = [...productsData];

  if (showAvailable) {
    filteredProducts = filteredProducts.filter(p => p.available);
  }

  if (sort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="face-container">

      {/* HERO */}
      <div className="face-hero">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
          alt="face banner"
        />
      </div>

      <div className="face-content">

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

        {/* RIGHT CONTENT */}
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
            {filteredProducts.map(product => (
              <div className="product-card" key={product.id}>
                <img src={product.img} alt={product.name} />
                <h4>{product.name}</h4>
                <p>₹{product.price}</p>

                <button className="cart-btn">
                  {product.available ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Face;