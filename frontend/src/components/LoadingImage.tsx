"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";

export function LoadingImage({ src, alt, containerClassName, imageClassName, onError, loading = "lazy", hostRef, isLoading = false }: {
  src: string;
  alt: string;
  containerClassName: string;
  imageClassName: string;
  onError?: () => void;
  loading?: "eager" | "lazy";
  hostRef?: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setLoaded(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <div ref={hostRef} className={`relative overflow-hidden ${containerClassName}`}>
      {(isLoading || !loaded) && <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(105deg, #151A2C 20%, #252B40 42%, #FF5A36 50%, #252B40 58%, #151A2C 80%)", backgroundSize: "220% 100%", backgroundPosition: "100% 50%" }}
        animate={reducedMotion ? { backgroundPosition: "50% 50%" } : { backgroundPosition: ["100% 50%", "-120% 50%"] }}
        transition={reducedMotion ? { duration: 0 } : { duration: 1.25, ease: "linear", repeat: Infinity }}
      />}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); onError?.(); }}
        className={`${imageClassName} relative transition-opacity duration-300 ${!isLoading && loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
