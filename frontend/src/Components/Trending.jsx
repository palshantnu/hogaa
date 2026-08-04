
import React, { useEffect, useState } from 'react';
import ScrollReveal from 'scrollreveal';
import { Heart, Star } from 'lucide-react';
import './Trending.css';
import { addToWishlist } from "../utils/wishlist";
import { addToCart } from "../utils/cart";
import discount from '../assets/discount.png';
import multi from '../assets/multi.png';
import hogaa9185 from '../assets/hogaa9185.jpg';
import hogaa9178 from '../assets/hogaa9178.jpg';
import hogaa9169 from '../assets/hogaa9169.jpg';
import hogaa9190 from '../assets/hogaa9190.jpg';
import hogaa9179 from '../assets/hogaa9179.jpg';
import { useNavigate } from "react-router-dom";
// const productsData = [
//   { id: 1, name: 'Lipstick', desc: 'Smooth matte finish with rich pigment.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.8, reviews: 125, image: hogaa9185, colors: ['#B74C4B', '#CC2E2D', '#C63F7B'] },
//   { id: 2, name: 'Foundation', desc: 'Full coverage with natural glow finish.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.5, reviews: 98, image: hogaa9178, colors: ['#E8BEAC', '#D39D83'] },
//   { id: 3, name: 'Nail Polish', desc: 'Long lasting glossy nail color.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.7, reviews: 150, image: hogaa9179, colors: ['#B74C4B', '#5C998D'] },
//   { id: 4, name: 'Serum', desc: 'Hydrating serum for glowing skin.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.9, reviews: 210, image: hogaa9190, size: '100ml' },
//   { id: 5, name: 'Mascara', desc: 'Volume boost mascara for bold lashes.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.6, reviews: 110, image: hogaa9169, size: '200ml' },
//   { id: 6, name: 'Compact', desc: 'Smooth finish powder for daily use.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.4, reviews: 85, image: hogaa9185, colors: ['#E8BEAC', '#D39D83'] },
//   { id: 7, name: 'Brush Set', desc: 'Professional brushes for perfect makeup.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 4.8, reviews: 160, image: hogaa9179, size: '150ml' },
//   { id: 8, name: 'Perfume', desc: 'Luxury fragrance with long lasting effect.', price: 499, oldPrice: 699, discount: '26% OFF', rating: 5.0, reviews: 195, image: hogaa9185, size: '120ml' }
// // ];

export const productsData = [
  {
    id: 1,
    name: 'Lipstick',
    desc: 'Smooth matte finish with rich pigment.',
    fullDesc: 'This premium matte lipstick delivers intense color payoff with a velvety smooth texture. Enriched with Vitamin E and natural oils, it keeps your lips hydrated while providing long-lasting wear. Smudge-proof, waterproof, and perfect for all-day glam looks.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.8,
    reviews: 125,
    image: hogaa9185,
    images: [hogaa9185, hogaa9178, hogaa9179],
    colors: ['#B74C4B', '#CC2E2D', '#C63F7B'],
    brand: 'hogaa Cosmetics',
    category: 'Makeup',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Highly pigmented formula',
      'Long-lasting matte finish',
      'Smudge-proof & waterproof',
      'Lightweight and comfortable',
      'Enriched with Vitamin E'
    ]
  },

  {
    id: 2,
    name: 'Foundation',
    desc: 'Full coverage with natural glow finish.',
    fullDesc: 'Achieve a flawless complexion with this full-coverage foundation that blends seamlessly into your skin. Its lightweight formula provides a natural glow while covering imperfections, leaving your skin looking smooth and radiant all day long.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.5,
    reviews: 98,
    image: hogaa9178,
    images: [hogaa9178, hogaa9185, hogaa9179],
    colors: ['#E8BEAC', '#D39D83'],
    brand: 'hogaa Cosmetics',
    category: 'Face',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Full coverage formula',
      'Natural glowing finish',
      'Lightweight & breathable',
      'Suitable for all skin types'
    ]
  },

  {
    id: 3,
    name: 'Nail Polish',
    desc: 'Long lasting glossy nail color.',
    fullDesc: 'Add a pop of color to your nails with this high-shine nail polish. Its quick-drying formula ensures a smooth and glossy finish that lasts for days without chipping.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.7,
    reviews: 150,
    image: hogaa9179,
    images: [hogaa9179, hogaa9185, hogaa9178],
    colors: ['#B74C4B', '#5C998D'],
    brand: 'hogaa Cosmetics',
    category: 'Nails',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Glossy finish',
      'Quick drying',
      'Long lasting',
      'Chip resistant'
    ]
  },

  {
    id: 4,
    name: 'Serum',
    desc: 'Hydrating serum for glowing skin.',
    fullDesc: 'This deeply hydrating serum nourishes your skin and enhances natural glow. Infused with powerful ingredients, it helps reduce dullness and improves skin texture over time.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.9,
    reviews: 210,
    image: hogaa9190,
    images: [hogaa9190, hogaa9185],
    size: '100ml',
    brand: 'hogaa Skincare',
    category: 'Skincare',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Deep hydration',
      'Improves skin texture',
      'Lightweight formula',
      'Enhances natural glow'
    ]
  },

  {
    id: 5,
    name: 'Mascara',
    desc: 'Volume boost mascara for bold lashes.',
    fullDesc: 'Get fuller, longer lashes instantly with this volumizing mascara. Its smudge-proof formula enhances lash definition and stays all day without clumping.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.6,
    reviews: 110,
    image: hogaa9169,
    images: [hogaa9169, hogaa9185],
    size: '200ml',
    brand: 'hogaa Cosmetics',
    category: 'Eyes',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Adds volume to lashes',
      'Smudge-proof',
      'Long-lasting wear',
      'Easy to apply'
    ]
  },

  {
    id: 6,
    name: 'Compact',
    desc: 'Smooth finish powder for daily use.',
    fullDesc: 'This compact powder gives a smooth matte finish while controlling oil and shine. Perfect for daily use, it blends effortlessly and enhances your natural look.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.4,
    reviews: 85,
    image: hogaa9185,
    images: [hogaa9185, hogaa9178],
    colors: ['#E8BEAC', '#D39D83'],
    brand: 'hogaa Cosmetics',
    category: 'Face',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Matte finish',
      'Controls oil',
      'Smooth texture',
      'Perfect for daily use'
    ]
  },

  {
    id: 7,
    name: 'Brush Set',
    desc: 'Professional brushes for perfect makeup.',
    fullDesc: 'This premium brush set includes all essential brushes needed for flawless makeup application. Designed with soft bristles for smooth blending and precision.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 4.8,
    reviews: 160,
    image: hogaa9179,
    images: [hogaa9179, hogaa9185],
    size: '150ml',
    brand: 'hogaa Pro Tools',
    category: 'Accessories',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Soft bristles',
      'Professional quality',
      'Easy blending',
      'Durable design'
    ]
  },

  {
    id: 8,
    name: 'Perfume',
    desc: 'Luxury fragrance with long lasting effect.',
    fullDesc: 'Experience a refreshing and luxurious fragrance that lasts all day. This perfume is crafted with premium ingredients to give you a confident and elegant aura.',
    price: 499,
    oldPrice: 699,
    discount: '26% OFF',
    rating: 5.0,
    reviews: 195,
    image: hogaa9185,
    images: [hogaa9185, hogaa9190],
    size: '120ml',
    brand: 'hogaa Fragrance',
    category: 'Fragrance',
    stock: 'In Stock',
    delivery: 'Delivery in 3-5 days',
    features: [
      'Long-lasting fragrance',
      'Premium ingredients',
      'Fresh & elegant scent',
      'Perfect for daily use'
    ]
  }
]

const ProductsGrid = () => {
  const navigate = useNavigate();
  // const [qty, setQty] = useState({});
  // useEffect(() => {
  //   ScrollReveal().reveal('.product-card', { interval: 80 });
  // }, []);
  // const handleIncrease = (id) => {
  //   setQty((prev) => ({
  //     ...prev,
  //     [id]: (prev[id] || 1) + 1
  //   }));
  // };

  // // ➖ Decrement
  // const handleDecrease = (id) => {
  //   setQty((prev) => ({
  //     ...prev,
  //     [id]: prev[id] > 1 ? prev[id] - 1 : 1
  //   }));
  // };

  return (
    <div className="trending-products-container">

      <div className="section-header">
        <h2 className="section-title">Trending Products</h2>
        <span className="view-all">View All Products →</span>
      </div>

      <div className="product-grid-8">
        {productsData.map((product) => (
          < div
            key={product.id}
            className="product-card"
            onClick={() => 
  navigate(`/product/${product.id}`, { state: product })
}
          >
            <div className="card-top-action">
              <span></span>
              {/* <button className="wishlist-btn"><Heart size={18} /></button> */}
              <button
  className="wishlist-btn"
  onClick={(e) => {
    e.stopPropagation();
    addToWishlist(product);
    alert("Added to wishlist ❤️");
  }}
>
  <Heart size={18} />
</button>
            </div>

            <div className="image-container-placeholder">
              <img src={product.image} alt="" className="p-img" />
            </div>

            <div className="product-info-box">

              <h3 className="p-name">{product.name}</h3>
              <p className="p-desc">{product.desc}</p>

              <div className="rating-row">
                <span>{product.rating}</span>
                <Star size={12} fill="#000" />
                <span>({product.reviews})</span>
              </div>

              <div className="price-row">
                <span className="new-price">₹{product.price}</span>
                <span className="old-price">₹{product.oldPrice}</span>
                <span className="discount">{product.discount}</span>
              </div>
               
               {/* <div className="qty">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div> */}
                {/* <div className="qty" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleDecrease(product.id)}>-</button>
              <span>{qty[product.id] || 1}</span>
              <button onClick={() => handleIncrease(product.id)}>+</button>
            </div> */}
           

              {/* SHADES / SIZE */}
              {product.colors ? (
                <div className="dots">
                  {product.colors.map((c, i) => (
                    <span key={i} className="dot" style={{ background: c }}></span>
                  ))}
                  <span className="spacer"></span>
                  {/* <span className="dot plus">+</span> */}
                </div>
              ) : (
                <span className="size">{product.size}</span>
              )}

              {/* <button className="add-bag-btn">ADD TO BAG</button> */}
               <button
  className="add-bag-btn"
  onClick={(e) => {
    e.stopPropagation();
    addToCart(product, 1);
    alert("Added to cart ✅");
  }}
>
  ADD TO BAG
</button>
            </div>
          </div>
        ))}
      </div>

    </div >
  );
};

export default ProductsGrid;