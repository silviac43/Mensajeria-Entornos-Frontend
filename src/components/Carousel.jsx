import React, { useState, useEffect, useCallback, useRef } from "react";

// Importa tus imágenes desde /src/images
import img1 from "../images/img1.jpg";
import img2 from "../images/img2.jpg";
import img3 from "../images/img3.jpg";
import img4 from "../images/img4.jpg";
import img5 from "../images/img5.jpg";

const images = [img1, img2, img3, img4, img5];

const Carousel = ({ slidesToShow = 3 }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const intervalRef = useRef(null);

  const next = useCallback(() => {
    setFade(true);
    setTimeout(() => {
      setStartIndex((prevIndex) => (prevIndex + 1) % images.length);
      setFade(false);
    }, 600);
  }, []);

  const prev = useCallback(() => {
    setFade(true);
    setTimeout(() => {
      setStartIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setFade(false);
    }, 600);
  }, []);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      next();
    }, 5000);
  }, [next]);

  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [resetInterval]);

  const handlePrev = () => {
    prev();
    resetInterval();
  };

  const handleNext = () => {
    next();
    resetInterval();
  };

  const visibleImages = Array.from({ length: slidesToShow }, (_, i) => {
    const index = (startIndex + i) % images.length;
    return images[index];
  });

  return (
    <div className="carousel-container position-relative my-3 w-100 d-flex justify-content-center align-items-center">
      <button
        className="carousel-arrow position-absolute"
        onClick={handlePrev}
        style={{
          left: 10,
          background: "transparent",
          border: "none",
          fontSize: "2rem",
          color: "#999",
          zIndex: 10,
          cursor: "pointer",
        }}
        aria-label="Anterior"
      >
        ‹
      </button>

      <div
        className={`carousel-track-container d-flex justify-content-center gap-3 w-100 ${
          fade ? "fade-out" : "fade-in"
        }`}
      >
        {visibleImages.map((src, i) => (
          <div key={i} className="carousel-slide">
            <img
              src={src}
              alt={`Imagen ${startIndex + i + 1}`}
              style={{
                width: "100%",
                maxWidth: "450px",
                height: "250px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        ))}
      </div>

      <button
        className="carousel-arrow position-absolute"
        onClick={handleNext}
        style={{
          right: 10,
          background: "transparent",
          border: "none",
          fontSize: "2rem",
          color: "#999",
          zIndex: 10,
          cursor: "pointer",
        }}
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  );
};

export default Carousel;
