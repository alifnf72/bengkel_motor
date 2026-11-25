"use client";
import { useState } from "react";
import { NO_PRODUCT_PHOTO } from "@/lib/product-image";
import { LoadingImage } from "@/components/LoadingImage";

export function CatalogImage({ src, category, name }: { src?: string | null; category: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const fallback = NO_PRODUCT_PHOTO;
  return <LoadingImage src={failed || !src ? fallback : src} alt={failed || !src ? "" : `Foto ${name}`} onError={() => setFailed(true)} containerClassName="h-36 w-full" imageClassName="h-full w-full object-cover" />;
}
