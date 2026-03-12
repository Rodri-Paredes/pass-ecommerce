import { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl } from '../../lib/imageOptimizer';

// Tiny transparent placeholder (avoids layout shift)
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  /** Target display width – used for Supabase image transforms (default 600) */
  width?: number;
  /** Image quality 1-100 (default 75) */
  quality?: number;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc,
  width = 600,
  quality = 75,
}: LazyImageProps) {
  const optimizedSrc = optimizeImageUrl(src, { width, quality });
  const [imageSrc, setImageSrc] = useState(placeholderSrc || PLACEHOLDER);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(optimizedSrc);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '200px' } // Start loading earlier (200px before viewport)
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [optimizedSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
