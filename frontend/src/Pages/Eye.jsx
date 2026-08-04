import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import "./Eye.css";

import kajalbanner from "../assets/kajalbanner.png";

// products images (tum apne assets ke hisab se change kar lena)
import kajal1 from '../assets/eyebrow.webp'; 
import kajal2 from '../assets/kajalcombo.jpg'; 
import kajal3 from  '../assets/liner1.jpg'; 
import kajal4 from  '../assets/mascara1.jfif'; 
import kajal5 from '../assets/liner2.webp'; 
import kajal6 from  '../assets/mascara2.avif'; 
import kajal7 from  '../assets/lipstick4.jpg'; 
import kajal8 from  '../assets/lipstick4.jpg'; 




const Kajal = () => {

  useEffect(() => {
    const sr = ScrollReveal({
      distance: "60px",
      duration: 1000,
      delay: 200,
      easing: "ease-in-out",
      reset: false,
    });

    sr.reveal(".hero-content", { origin: "left" });
    sr.reveal(".card", { origin: "bottom", interval: 100 });

  }, []);

  const products = [
    { name: "INTENSE BLACK KAJAL", img: kajal1 },
    { name: "SMUDGE PROOF KAJAL", img: kajal2 },
    { name: "24HR LONGWEAR KAJAL", img: kajal3 },
    { name: "DEEP BLACK EYELINER", img: kajal4 },
    { name: "VOLUME MASCARA", img: kajal5 },
    { name: "PRECISION EYEBROW PENCIL", img: kajal6 },
    { name: "SMOKEY EYES PALETTE", img: kajal7 },
    { name: "GLITTER EYESHADOW", img: kajal8 },
  ];

  return (
    <div className="kajal-page">

      {/* HERO */}
      <div className="hero">
        <img src={kajalbanner} alt="kajal banner" />

        <div className="hero-content">
          <h1>hogaa EYES</h1>
          <p>Define Your Eyes. Define Your Power.</p>
          <button>SHOP NOW</button>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="products">
        <h2>Eye Collection</h2>

        <div className="grid">
          {products.map((item, i) => (
            <div className="card" key={i}>

              <span className="badge">NEW</span>

              <img src={item.img} alt={item.name} />

              <h3>{item.name}</h3>

              {/* Shades */}
              <div className="shades">
                <span className="shade black"></span>
                <span className="shade brown"></span>
                <span className="shade blue"></span>
                <span className="shade purple"></span>
              </div>

              <p className="price">₹ 499</p>

              <button className="btn">ADD TO CART</button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Kajal;