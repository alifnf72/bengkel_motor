"use client";

import { useEffect, useRef, useState } from "react";
import { apiBlob } from "@/lib/api";
import { LoadingImage } from "@/components/LoadingImage";

const imageBlobCache = new Map<number, Promise<Blob>>();

function loadProductImage(productId: number) {
  const cached = imageBlobCache.get(productId);
  if (cached) return cached;
  const request = apiBlob(`/products/${productId}/image`).catch((error) => {
    imageBlobCache.delete(productId);
    throw error;
  });
  imageBlobCache.set(productId, request);
  return request;
}

export function ProductImage({ productId, demoSrc, fallbackSrc, alt, className }: {
  productId?: number;
  demoSrc?: string;
  fallbackSrc: string;
  alt: string;
  className: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState(demoSrc ?? fallbackSrc);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (demoSrc) { setSrc(demoSrc); setIsLoading(false); return; }
    if (!productId) { setSrc(fallbackSrc); setIsLoading(false); return; }

    let active = true;
    let objectUrl: string | null = null;
    setIsLoading(true);
    const load = async () => {
      try {
        const blob = await loadProductImage(productId);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        if (active) setSrc(fallbackSrc);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const node = host.current;
    if (!node || !("IntersectionObserver" in window)) void load();
    else {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { observer.disconnect(); void load(); }
      }, { rootMargin: "160px" });
      observer.observe(node);
      return () => { active = false; observer.disconnect(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [productId, demoSrc, fallbackSrc]);

  return <LoadingImage hostRef={host} src={src} alt={alt} containerClassName={className} imageClassName="h-full w-full object-cover" onError={() => setSrc(fallbackSrc)} isLoading={isLoading} />;
}
