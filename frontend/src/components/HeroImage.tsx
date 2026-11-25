"use client";

import { useEffect, useState } from "react";
import { LoadingImage } from "@/components/LoadingImage";

export function HeroImage({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src || "/images/hero-bengkel.png";
  useEffect(() => { setFailed(false); }, [imageSrc]);
  return <LoadingImage
    src={failed ? "/images/hero-parts.svg" : imageSrc}
    alt={failed ? "Ilustrasi ban dan onderdil motor" : "Toko Akay Ban dan produk onderdil motor"}
    onError={() => setFailed(true)}
    loading="eager"
    containerClassName="aspect-[1.12/1] w-full"
    imageClassName="h-full w-full object-cover"
  />;
}
