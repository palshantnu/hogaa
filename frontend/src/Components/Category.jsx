import React, { useState, useEffect, useRef } from 'react';
import './Category.css';
import { useNavigate } from "react-router-dom";

const CategorySection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://admin.hogaacosmetics.com/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies if needed
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        } else {
          setError(data.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Handle category click - navigate to category products page
  const handleCategoryClick = (category) => {
    navigate(`collections/${category.slug}`, { 
      state: { 
        categoryId: category.id,
        categoryName: category.name,
        categoryslug: category.slug
      } 
    });
  };

  // Get image URL (handle both local and external URLs)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    // If it's already a full URL (http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If it's a local path from server
    if (imagePath.startsWith('/uploads/')) {
      return `https://admin.hogaacosmetics.com${imagePath}`;
    }
    // Default
    return `https://admin.hogaacosmetics.com/uploads/categories/${imagePath}`;
  };

  // Loading state
  if (loading) {
    return (
      <section className="hoga-section">
        <div className="hoga-header">
          <h2 className="hoga-title">Categories</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="hoga-section">
        <div className="hoga-header">
          <h2 className="hoga-title">Categories</h2>
        </div>
        <div className="error-container">
          <p>Error loading categories: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
    {/* Category Nav Strip */}
    {!loading && !error && categories.length > 0 && (
      <div className="cat-nav-strip">
        {categories.map((category, index) => (
          <React.Fragment key={category.id}>
            <button
              className="cat-nav-item"
              onClick={() => handleCategoryClick(category)}
            >
              {category.name}
            </button>
            {index < categories.length - 1 && (
              <span className="cat-nav-divider">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    )}

    <section className="hoga-section">
      <div className="hoga-header">
        <h2 className="hoga-title">Shop by Category</h2>
        <div className="hoga-nav">
          <div className="hoga-btns">
            <button onClick={() => scroll('left')} className="hoga-arrow">‹</button>
            <button onClick={() => scroll('right')} className="hoga-arrow">›</button>
          </div>
        </div>
      </div>

     <div className="hoga-carousel" ref={scrollRef}>
  {categories.length > 0 ? (
    categories.map((category) => (
      <div 
        key={category.id} 
        className="hoga-card"
        onClick={() => handleCategoryClick(category)}
      >
        <div className="hoga-img-box">
          <img 
            src={getImageUrl(category.image)} 
            alt={category.name}
            onError={(e) => {
              e.target.src = '/placeholder-category.jpg';
            }}
          />
          {/* Text overlay on image */}
          <div className="category-info">
            <p className="hoga-name">{category.name}</p>
            {category.product_count > 0 && (
              <span className="product-count">{category.product_count} products</span>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="no-categories">
      <p>No categories found</p>
    </div>
  )}
</div>
    </section>
    </>
  );
};

export default CategorySection;