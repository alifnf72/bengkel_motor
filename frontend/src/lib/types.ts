export type Product = {
  id: number; sku: string; barcode: string | null; nama: string; kategori: string; gambar_path?: string | null; demo_image?: string;
  harga_jual: number; harga_beli?: number; stok: number; stok_min: number; is_jasa: boolean;
};
export type User = { id: number; name: string; email: string; role: "admin" | "kasir" | "gudang" };
export type ShopProfile = {
  nama: string;
  tagline: string;
  alamat: string;
  jam: string;
  telp: string;
  wa: string;
  hero_badge: string;
  hero_judul: string;
  hero_deskripsi: string;
  hero_image: string | null;
  logo_image: string | null;
  tentang_judul: string;
  highlights: { no: string; title: string; desc: string }[];
};
