// import React, { useEffect } from "react";
// import ScrollReveal from "scrollreveal";
// import "./Combo.css";
// import { useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { addToCart } from "../utils/cart";

// import combo1 from '../assets/combo1.webp';
// import combo2 from '../assets/combo2.jpg';
// import lipstick4 from '../assets/lipstick4.jpg';
// const ComboSection = () => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     ScrollReveal().reveal(".combo-card", {
//       duration: 1000,
//       distance: "60px",
//       origin: "right",
//       interval: 200,
//       easing: "ease-in-out",
//       opacity: 0,
//     });
//   }, []);

//   const combos = [
//     {
//       img: combo1,
//       title: "hogaa Matte Lipstick Combo",
//       price: "₹499",
//       oldPrice: "₹699",
//       discount: "30% OFF",
//     },
//     {
//       img: combo2,
//       title: "hogaa Lip Gloss & Balm Combo",
//       price: "₹549",
//       oldPrice: "₹749",
//       discount: "26% OFF",
//     },
//     {
//       img: lipstick4,
//       title: "hogaa Party Makeup Kit Combo",
//       price: "₹999",
//       oldPrice: "₹1399",
//       discount: "30% OFF",
//     },
//     {
//       img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
//       title: "hogaa Lip Cream & Kajal Combo",
//       price: "₹699",
//       oldPrice: "₹899",
//       discount: "22% OFF",
//     },
//     {
//       img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
//       title: "hogaa Transproof Lipstick Combo",
//       price: "₹799",
//       oldPrice: "₹1099",
//       discount: "27% OFF",
//     },
//     {
//       img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
//       title: "hogaa Matte Attack Combo",
//       price: "₹899",
//       oldPrice: "₹1199",
//       discount: "25% OFF",
//     },
//   ];

//   const scrollRef = useRef(null);
//   const scrollLeft = () => {
//     scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
//   };

//   const scrollRight = () => {
//     scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
//   };
//   return (
//     <section className="combo-section">

//       {/* <h2 className="combo-heading">hogaa COMBO COLLECTION</h2>
         
//       <div className="arrow-group">
//     <button onClick={scrollLeft}>‹</button>
//     <button onClick={scrollRight}>›</button>
//   </div> */}
//       <div className="combo-header">
//         <h2 className="combo-heading">hogaa COMBO COLLECTION</h2>

//         <div className="arrow-group">
//           <button onClick={scrollLeft}>‹</button>
//           <button onClick={scrollRight}>›</button>
//         </div>
//       </div>


//       <div className="combo-scroll" ref={scrollRef}>

//         {combos.map((item, index) => (
//           <div className="combo-card" key={index}

//             onClick={() =>
//               navigate(`/product/${item.id}`, { state: item })
//             }

//           >

//             <div className="combo-img-box">
//               <img src={item.img} alt={item.title} />
//               <span className="combo-badge">hogaa</span>
//             </div>

//             <h3 className="combo-title">{item.title}</h3>

//             <div className="combo-price">
//               <span className="new">{item.price}</span>
//               <span className="old">{item.oldPrice}</span>
//               <span className="off">{item.discount}</span>
//             </div>
//             {/* <div className="qty">
//                 <button>-</button>
//                 <span>1</span>
//                 <button>+</button>
//               </div>
//             */}
//             <button className="combo-btn" onClick={(e) => {
//               e.stopPropagation();
//               addToCart(item, 1);
//               alert("Added to cart ✅");
//             }}>ADD TO CART</button>

//           </div>
//         ))}

//       </div>
//     </section>
//   );
// };

// export default ComboSection;

























import React, { useEffect, useRef } from "react";
import ScrollReveal from "scrollreveal";
import "./Combo.css";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";

import combo1 from "../assets/combo1.webp";
import combo2 from "../assets/combo2.jpg";
import lipstick4 from "../assets/lipstick4.jpg";

const ComboSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    ScrollReveal().reveal(".combo-card", {
      duration: 1000,
      distance: "60px",
      origin: "right",
      interval: 200,
      easing: "ease-in-out",
      opacity: 0,
    });
  }, []);

  // ✅ FIXED DATA
  const combos = [
    {
      id: 101,
      name: "hogaa Matte Lipstick Combo",
      image: combo1,
      images: [combo1,combo1],
      price: 499,
      oldPrice: 699,
      discount: "30% OFF",
    },
    {
      id: 102,
      name: "hogaa Lip Gloss & Balm Combo",
      image: combo2,
      price: 549,
      oldPrice: 749,
      discount: "26% OFF",
    },
    {
      id: 103,
      name: "hogaa Party Makeup Kit Combo",
      image: lipstick4,
      price: 999,
      oldPrice: 1399,
      discount: "30% OFF",
    },
    {
      id: 104,
      name: "hogaa Lip Cream & Kajal Combo",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
      price: 699,
      oldPrice: 899,
      discount: "22% OFF",
    },
    {
      id: 105,
      name: "hogaa Transproof Lipstick Combo",
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
      price: 799,
      oldPrice: 1099,
      discount: "27% OFF",
    },
    {
      id: 106,
      name: "hogaa Matte Attack Combo",
      image:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
      price: 899,
      oldPrice: 1199,
      discount: "25% OFF",
    },
  ];

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className="combo-section">
      <div className="combo-header">
        <h2 className="combo-heading">hogaa COMBO COLLECTION</h2>

        <div className="arrow-group">
          <button onClick={scrollLeft}>‹</button>
          <button onClick={scrollRight}>›</button>
        </div>
      </div>

      <div className="combo-scroll" ref={scrollRef}>
        {combos.map((item) => (
          <div
            className="combo-card"
            key={item.id}
            onClick={() =>
              navigate(`/product/${item.id}`, { state: item })
            }
          >
            <div className="combo-img-box">
              <img src={item.image} alt={item.name} />
              <span className="combo-badge">hogaa</span>
            </div>

            <h3 className="combo-title">{item.name}</h3>

            <div className="combo-price">
              <span className="new">₹{item.price}</span>
              <span className="old">₹{item.oldPrice}</span>
              <span className="off">{item.discount}</span>
            </div>

            <button
              className="combo-btn"
              onClick={(e) => {
                e.stopPropagation();

               addToCart(item, 1);

                alert("Added to cart ✅");
              }}
            >
              ADD TO CART
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ComboSection;