const images: Record<string, string> = {
  oli: "/images/products/oli.svg",
  ban: "/images/products/ban.svg",
  rem: "/images/products/rem.svg",
  aki: "/images/products/aki.svg",
  busi: "/images/products/busi.svg",
  filter: "/images/products/filter.svg",
  rantai: "/images/products/rantai.svg",
  lampu: "/images/products/lampu.svg",
};

export function productImage(category: string): string {
  const normalized = category.trim().toLocaleLowerCase("id-ID");
  return images[normalized] ?? "/images/products/lainnya.svg";
}
