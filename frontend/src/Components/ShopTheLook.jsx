import React from "react";
import { useNavigate } from "react-router-dom";
import "./ShopTheLook.css";

import img1 from "../assets/photo/1.jpeg";
import img2 from "../assets/photo/2.jpeg";
import img3 from "../assets/photo/3.jpeg";
import img4 from "../assets/photo/4.jpeg";
import img5 from "../assets/photo/5.png";
import img6 from "../assets/photo/6.png";
import img7 from "../assets/photo/7.png";
import img8 from "../assets/photo/8.jpeg";
import img9 from "../assets/photo/9.jpeg";
import img10 from "../assets/photo/10.jpeg";

const images = [
  { id: 1, src: img1, label: "Lip Color", link: "/collections/lips" },
  { id: 2, src: img2, label: "Foundation", link: "/collections/face" },
  { id: 3, src: img3, label: "Eye Look", link: "/collections/eyes" },
  { id: 4, src: img4, label: "Blush", link: "/collections/face" },
  { id: 5, src: img5, label: "Nail Art", link: "/collections/nails" },
  { id: 6, src: img6, label: "Highlighter", link: "/collections/face" },
  { id: 7, src: img7, label: "Mascara", link: "/collections/eyes" },
  { id: 8, src: img8, label: "Lip Gloss", link: "/collections/lips" },
  { id: 9, src: img9, label: "Concealer", link: "/collections/face" },
  { id: 10, src: img10, label: "Kajal", link: "/collections/eyes" },
];

const ShopTheLook = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate(item.link)}
          >
            <img src={item.src} alt={item.label} loading="lazy" />
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
