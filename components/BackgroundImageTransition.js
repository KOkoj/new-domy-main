'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  // Preload next image for smoother transitions
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      const nextImage = new window.Image();
      nextImage.src = images[nextIndex].src;
    }
  }, [currentImageIndex, images]);

  if (images.length === 0) return null;

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      {images.map((image, index) => (
        <div
          key={image.src}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: index === currentImageIndex && !isTransitioning ? 1 : 0,
            transition: `opacity ${fadeDuration}ms ease-in-out`
          }}
        >
          <Image
            src={image.src}
            alt={image.alt || `Background image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundImageTransition;
