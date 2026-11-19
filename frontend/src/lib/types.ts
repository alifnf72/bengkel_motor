export type Product = {
  id: number; sku: string; barcode: string | null; nama: string; kategori: string; gambar_path?: string | null;
  harga_jual: number; harga_beli?: number; stok: number; stok_min: number; is_jasa: boolean;
};
export type User = { id: number; name: string; email: string; role: "admin" | "kasir" | "gudang" };
