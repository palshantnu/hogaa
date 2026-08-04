import React, { useEffect, useRef } from "react";
import ScrollReveal from "scrollreveal";
import { Star } from "lucide-react";
import "./Bestseller.css";

import lip from "../assets/lipstik.png";
import foundation from "../assets/foundation.png";
import nail from "../assets/nailpaint.png";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";
const products = [
  {
    id: 1, name: "Matte Lipstick", desc: "Smooth matte finish with rich pigment.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.8, reviews: 120, img: lip, colors: ["#c0392b", "#e74c3c", "#d2527f"]
  },
  {
    id: 2, name: "Foundation Stick", desc: "Full coverage with natural glow finish.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.5, reviews: 98, img: foundation, colors: ["#e0b7a3", "#c68c6d", "#9b6b4e"]
  },
  {
    id: 3, name: "Nail Polish", desc: "Long lasting glossy nail color.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.7, reviews: 150, img: nail, size: "10ml"
  },
  {
    id: 4, name: "Lip Gloss", desc: "Shiny gloss with smooth texture.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.6, reviews: 110, img: lip, colors: ["#ff6b6b", "#ff4757"]
  },
  {
    id: 5, name: "Compact Powder", desc: "Smooth finish powder.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.4, reviews: 85, img: foundation, colors: ["#e0b7a3", "#c68c6d"]
  },
  {
    id: 6, name: "Eye Mascara", desc: "Volume boost mascara.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF",
    rating: 4.6, reviews: 110, img: lip, size: "8ml"
  },
  {
    id: 7, name: "Lip Tint", desc: "Lightweight tint.", price: "₹499", oldPrice: "₹749",
    discount: "26% OFF", rating: 4.5, reviews: 90, img: lip, colors: ["#ff6b6b", "#c0392b"]
  },
  {
    id: 8, name: "Face Serum", desc: "Hydrating serum.", price: "₹499",
    oldPrice: "₹749",
    discount: "26% OFF", rating: 4.9, reviews: 200, img: foundation, size: "30ml"
  }
];

const Bestseller = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    ScrollReveal().reveal(".hogaa-card", {
      distance: "40px",
      origin: "bottom",
      duration: 800,
      interval: 100
    });
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="hogaa-container">

      <div className="slider-header">
        <h2>BESTSELLERS</h2>
        <div className="slider-arrows">
          <button onClick={scrollLeft}>‹</button>
          <button onClick={scrollRight}>›</button>
        </div>
      </div>

      <div className="hogaa-slider" ref={scrollRef}>
        {products.map((item) => (
          <div className="hogaa-card" key={item.id}
            onClick={() =>
              navigate(`/product/${item.id}`, { state: item })}
          >

            <img src={item.img} alt="" />

            <h4>{item.name}</h4>
            <p className="desc">{item.desc}</p>

            <div className="rating">
              <span>{item.rating}</span>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#000" />
              ))}
              <span>({item.reviews})</span>
            </div>

            {/* <p className="price">{item.price}</p> */}

            <div className="price-row">
              <span className="new-price">{item.price}</span>
              <span className="old-price">{item.oldPrice}</span>
              <span className="discount">{item.discount}</span>
            </div>

            {/* <div className="qty">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div> */}

            {item.colors ? (
              <div className="dots">
                {item.colors.map((c, i) => (
                  <span key={i} className="dot" style={{ background: c }}></span>
                ))}
                <span className="spacer"></span>
                {/* <span className="dot plus">+</span> */}
              </div>
            ) : (
              <span className="size">{item.size}</span>
            )}

            <button onClick={(e) => {
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

export default Bestseller;














































// import React, { useEffect, useRef, useState } from "react";
// import ScrollReveal from "scrollreveal";
// import { Star } from "lucide-react";
// import "./Bestseller.css";
// import { useNavigate } from "react-router-dom";

// const Bestseller = () => {
//   const navigate = useNavigate();
//   const scrollRef = useRef(null);

//   const [products, setProducts] = useState([]);

//   // 🔥 FETCH BESTSELLER PRODUCTS FROM BACKEND
//   useEffect(() => {
//     fetch("http://localhost:5000/api/products?bestSeller=true")
//       .then((res) => res.json())
//       .then((data) => {
//         setProducts(data.data.products);
//       })
//       .catch((err) => console.log(err));
//   }, []);

//   // 🔥 SCROLL ANIMATION
//   useEffect(() => {
//     ScrollReveal().reveal(".hogaa-card", {
//       distance: "40px",
//       origin: "bottom",
//       duration: 800,
//       interval: 100,
//     });
//   }, [products]);

//   const scrollLeft = () => {
//     scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
//   };

//   const scrollRight = () => {
//     scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
//   };

//   return (
//     <div className="hogaa-container">
//       <div className="slider-header">
//         <h2>BESTSELLERS</h2>
//         <div className="slider-arrows">
//           <button onClick={scrollLeft}>‹</button>
//           <button onClick={scrollRight}>›</button>
//         </div>
//       </div>

//       <div className="hogaa-slider" ref={scrollRef}>
//         {products.map((item) => {
//           const variant = item.variants?.[0]; // first variant

//           return (
//             <div
//               className="hogaa-card"
//               key={item._id}
//               onClick={() => navigate(`/product/${item._id}`)}
//             >
//               {/* 🔥 IMAGE */}
//               <img
//                 src={`http://localhost:5000${variant?.images?.[0]?.url}`}
//                 alt={item.name}
//               />

//               <h4>{item.name}</h4>
//               <p className="desc">{item.description}</p>

//               {/* 🔥 RATING */}
//               <div className="rating">
//                 <span>{item.rating}</span>
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} size={12} fill="#000" />
//                 ))}
//                 <span>({item.numReviews})</span>
//               </div>

//               {/* 🔥 PRICE */}
//               <div className="price-row">
//                 <span className="new-price">
//                   ₹{variant?.discountPrice || variant?.price}
//                 </span>

//                 {variant?.discountPrice && (
//                   <span className="old-price">₹{variant?.price}</span>
//                 )}

//                 {variant?.discountPrice && (
//                   <span className="discount">
//                     {Math.round(
//                       ((variant.price - variant.discountPrice) /
//                         variant.price) *
//                         100
//                     )}
//                     % OFF
//                   </span>
//                 )}
//               </div>

//               {/* 🔥 VARIANT INFO */}
//               {variant?.color ? (
//                 <div className="dots">
//                   <span
//                     className="dot"
//                     style={{ background: variant.color }}
//                   ></span>
//                 </div>
//               ) : (
//                 <span className="size">
//                   {variant?.value} {variant?.unit}
//                 </span>
//               )}

//               <button>ADD TO BAG</button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Bestseller;