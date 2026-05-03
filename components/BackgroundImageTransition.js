'use client';

import { useState, useEffect } from 'react';

const BackgroundImageTransition = ({ 
  images = [], 
  transitionDuration = 5000, 
  fadeDuration = 1000,
  className = "" 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % images.length
        );
        setIsTransitioning(false);
      }, fadeDuration / 2);
    }, transitionDuration);

    return () => clearInterval(interval);
  }, [images.length, transitionDuration, fadeDuration]);

  // Preload next image src for smoother transitions
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      const next = images[nextIndex];
      const preload = new window.Image();
      preload.src = next.webpSrc || next.src;
    }
  }, [currentImageIndex, images]);

  if (images.length === 0) return null;

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      {images.map((image, index) => {
        const isFirst = index === 0;
        return (
          <div
            key={image.src}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: index === currentImageIndex && !isTransitioning ? 1 : 0,
              transition: `opacity ${fadeDuration}ms ease-in-out`
            }}
          >
            {/*
              Use a <picture> element instead of next/image so the browser can
              discover and fetch the correct pre-optimised source from the
              server-rendered HTML, giving us a reliable preload match.
            */}
            <picture style={{ display: 'contents' }}>
              {image.avifSrc && (
                <source type="image/avif" srcSet={image.avifSrc} />
              )}
              {image.webpSrc && (
                <source type="image/webp" srcSet={image.webpSrc} />
              )}
              <img
                src={image.src}
                alt={image.alt || `Background image ${index + 1}`}
                fetchPriority={isFirst ? 'high' : undefined}
                decoding={isFirst ? 'sync' : 'async'}
                loading={isFirst ? 'eager' : 'lazy'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </picture>
          </div>
        );
      })}
    </div>
  );
};

export default BackgroundImageTransition;
