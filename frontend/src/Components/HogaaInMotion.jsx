import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HogaaInMotion.css";

const API_BASE = "https://admin.hogaacosmetics.com";

const HogaaInMotion = () => {
  const navigate = useNavigate();
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGifs = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/hogaa-in-motion`);
        const data = await response.json();
        setGifs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching Hogaa In Motion GIFs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGifs();
  }, []);

  if (loading || gifs.length === 0) {
    return null;
  }

  const handleClick = (link) => {
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <section className="him-section">
      <div className="him-header">
        <h2 className="him-title">Hogaa in Motion</h2>
      </div>

      <div className="him-row">
        {gifs.map((item) => (
          <div
            key={item.id}
            className={`him-item ${item.link ? "him-clickable" : ""}`}
            onClick={() => handleClick(item.link)}
          >
            <img
              src={`${API_BASE}${item.image_url}`}
              alt={item.title || "Hogaa in motion"}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HogaaInMotion;
