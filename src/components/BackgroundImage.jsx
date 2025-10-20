// src/components/BackgroundImage.jsx
import React, { useState, useEffect } from 'react';

const BackgroundImage = ({ 
  src, 
  children, 
  fallbackColor = "#f8faf8",
  className = "",
  overlay = true 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };

    // Fallback timeout - if image takes too long
    const timeout = setTimeout(() => {
      if (!imageLoaded) {
        setImageError(true);
        setImageLoaded(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [src]);

  return (
    <div 
      className={`min-vh-100 w-100 position-relative ${className}`}
      style={{
        backgroundColor: fallbackColor,
        backgroundImage: imageLoaded && !imageError ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {/* Optional overlay for better text readability */}
      {overlay && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Loading spinner */}
      {!imageLoaded && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: fallbackColor,
            zIndex: 2,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <div className="text-center">
            <div 
              className="spinner-border text-primary mb-3" 
              style={{ 
                width: '3rem', 
                height: '3rem',
                color: '#2d5a27 !important'
              }} 
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 3,
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BackgroundImage;