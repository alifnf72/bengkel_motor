"use client";

import { useState } from "react";

export function HeroImage() {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? "/images/hero-parts.svg" : "/images/hero-bengkel.png"}
      alt={failed ? "Ilustrasi ban dan onderdil motor" : "Toko Akay Ban dan produk onderdil motor"}
      onError={() => setFailed(true)}
      className="aspect-[1.12/1] w-full object-cover"
    />
  );
}
