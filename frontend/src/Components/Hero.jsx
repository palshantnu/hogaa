import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "./Hero.css";

const HeroSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('https://admin.hogaacosmetics.com/api/banners');
      const data = await response.json();
      setBanners(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hero-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="hero-slider">
      <Swiper
        modules={[Navigation, Autoplay, EffectFade, Pagination]}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        effect="fade"
        speed={800}
        grabCursor={true}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="slide">
              {/* Render based on media type - a GIF uploaded into the "video" slot still
                  has media_type "video" in the DB, so it needs an <img>, not <video>. */}
              {banner.media_type === 'video' && !/\.gif($|\?)/i.test(banner.media_url || '') ? (
                <div className="video-container">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={`https://admin.hogaacosmetics.com${banner.thumbnail_url}`}
                    className="hero-video"
                  >
                    <source src={`https://admin.hogaacosmetics.com${banner.media_url}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <img
                  src={`https://admin.hogaacosmetics.com${banner.media_url}`}
                  alt={banner.title}
                  loading="lazy"
                />
              )}

              {/* {banner.media_type !== 'video' && <div className="overlay"></div>
              }
              {banner.media_type !== 'video' && <div className="content">
                <h1>{banner.title}</h1>
                {banner.description && <p>{banner.description}</p>}
                {banner.link && (
                  <a href={banner.link} className="btn-primary">
                    Shop Now
                  </a>
                )}
              </div>} */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;