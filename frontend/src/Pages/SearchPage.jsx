import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./SearchPage.css";

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
        if (!query.trim()) {
            setProducts([]);
            return;
        }
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://admin.hogaacosmetics.com/api/products?search=${encodeURIComponent(query)}&show_variations=true`,
                    { credentials: "include" }
                );
                const data = await res.json();
                if (data.success) {
                    setProducts(data.products || []);
                } else {
                    setProducts([]);
                }
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue.trim() });
        }
    };

    const getImageUrl = (product) => {
        if (!product.images || product.images.length === 0) return null;
        const img = product.images[0];
        if (img.startsWith("http")) return img;
        if (img.startsWith("/uploads/")) return `https://admin.hogaacosmetics.com${img}`;
          const isVariationImage =
    img.startsWith('variation-');

  // Variation image URL
  if (isVariationImage) {
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${img}`;
  }
        return `https://admin.hogaacosmetics.com/uploads/products/${img}`;
    };

    const getPrice = (product) => {
        if (product.display_price) return product.display_price;
        if (product.price) return `₹${parseFloat(product.price).toLocaleString("en-IN")}`;
        return "";
    };

    return (
        <div className="search-page">
            <div className="search-page-header">
                <form className="search-page-form" onSubmit={handleSearch}>
                    <div className="search-page-input-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search for products..."
                            autoFocus
                        />
                        {inputValue && (
                            <button type="button" className="sp-clear" onClick={() => { setInputValue(""); setProducts([]); setSearchParams({}); }}>✕</button>
                        )}
                    </div>
                    <button type="submit" className="sp-search-btn">Search</button>
                </form>
            </div>

            <div className="search-page-body">
                {loading && (
                    <div className="sp-loading">
                        <div className="sp-spinner"></div>
                        <p>Searching...</p>
                    </div>
                )}

                {!loading && query && products.length === 0 && (
                    <div className="sp-empty">
                        <div className="sp-empty-icon">🔍</div>
                        <h3>No results for "{query}"</h3>
                        <p>Try different keywords or browse our categories</p>
                        <button onClick={() => navigate("/")}>Go to Home</button>
                    </div>
                )}

                {!loading && !query && (
                    <div className="sp-empty">
                        <div className="sp-empty-icon">✨</div>
                        <h3>What are you looking for?</h3>
                        <p>Search our entire collection of beauty products</p>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <>
                        <p className="sp-result-count">{products.length} results for "{query}"</p>
                        <div className="sp-grid">
                            {products.map((product) => {
                                const discount = product.discount_percentage || 0;
                                return (
                                    <div
                                        key={product.id}
                                        className="sp-card"
                                        onClick={() => navigate(product.slug ? `/product/${product.slug}` : `/product/${product.id}`)}
                                    >
                                        <div className="sp-img-wrap">
                                            {discount > 0 && <span className="sp-discount">{discount}% OFF</span>}
                                            {getImageUrl(product) ? (
                                                <img src={getImageUrl(product)} alt={product.name} loading="lazy" />
                                            ) : (
                                                <div className="sp-no-img">No Image</div>
                                            )}
                                        </div>
                                        <div className="sp-info">
                                            <h4>{product.name}</h4>
                                            <p>{product.short_description || ""}</p>
                                            <div className="sp-price-row">
                                                <span className="sp-price">{getPrice(product)}</span>
                                                {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                                                    <span className="sp-compare">₹{parseFloat(product.compare_price).toLocaleString("en-IN")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
