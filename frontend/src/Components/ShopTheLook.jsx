import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ShopTheLook.css";

const API_BASE = "https://admin.hogaacosmetics.com";

const ShopTheLook = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/shop-the-look`);
        const data = await response.json();
        setImages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching Shop The Look images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading || images.length === 0) {
    return null;
  }

  const handleImageClick = (link) => {
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <section className="stl-section">
      <div className="stl-header">
        <h2 className="stl-title">Shop The Look</h2>
        {/* <p className="stl-sub">Explore our trending collections</p> */}
      </div>

      <div className="stl-grid">
        {images.map((item) => (
          <div
            key={item.id}
            className="stl-card"
            onClick={() => handleImageClick(item.link)}
          >
            <img src={`${API_BASE}${item.image_url}`} alt={item.label || "Shop the look"} loading="lazy" />
            <div className="stl-overlay">
              {/* <span className="stl-label">{item.label}</span> */}
              {/* <button className="stl-btn">Shop Now</button> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopTheLook;
