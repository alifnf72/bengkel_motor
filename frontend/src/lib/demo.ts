import type { Product, User } from "@/lib/types";

export const DEMO_USER: User = { id: 1, name: "Pemilik Demo", email: "admin@bengkel.test", role: "admin" };

export const DEMO_PRODUCTS: Product[] = [
  { id: 1, sku: "OLI-001", barcode: "899000100001", nama: "Oli Mesin 0.8L MPX2", kategori: "Oli", harga_jual: 48000, harga_beli: 38000, stok: 24, stok_min: 5, is_jasa: false },
  { id: 2, sku: "OLI-002", barcode: "899000100002", nama: "Oli Gardan 120ml", kategori: "Oli", harga_jual: 12000, harga_beli: 8500, stok: 30, stok_min: 8, is_jasa: false },
  { id: 3, sku: "BAN-001", barcode: "899000200001", nama: "Ban Luar 80/90-14", kategori: "Ban", harga_jual: 235000, harga_beli: 195000, stok: 6, stok_min: 4, is_jasa: false },
  { id: 4, sku: "BAN-002", barcode: "899000200002", nama: "Ban Dalam 250/275-17", kategori: "Ban", harga_jual: 32000, harga_beli: 24000, stok: 12, stok_min: 5, is_jasa: false },
  { id: 5, sku: "KRM-001", barcode: "899000300001", nama: "Kampas Rem Depan Beat", kategori: "Rem", harga_jual: 35000, harga_beli: 26000, stok: 3, stok_min: 5, is_jasa: false },
  { id: 6, sku: "KRM-002", barcode: "899000300002", nama: "Kampas Rem Belakang Vario", kategori: "Rem", harga_jual: 38000, harga_beli: 28000, stok: 10, stok_min: 5, is_jasa: false },
  { id: 7, sku: "AKI-001", barcode: "899000400001", nama: "Aki GS Astra 3.5Ah", kategori: "Aki", harga_jual: 165000, harga_beli: 135000, stok: 5, stok_min: 3, is_jasa: false },
  { id: 8, sku: "BSI-001", barcode: "899000500001", nama: "Busi NGK CPR8EA", kategori: "Busi", harga_jual: 28000, harga_beli: 20000, stok: 40, stok_min: 10, is_jasa: false },
  { id: 9, sku: "FLT-001", barcode: "899000600001", nama: "Filter Udara Mio", kategori: "Filter", harga_jual: 42000, harga_beli: 31000, stok: 8, stok_min: 4, is_jasa: false },
  { id: 10, sku: "RNT-001", barcode: "899000700001", nama: "Rantai Set 428H", kategori: "Rantai", harga_jual: 145000, harga_beli: 115000, stok: 0, stok_min: 3, is_jasa: false },
  { id: 11, sku: "LMP-001", barcode: "899000800001", nama: "Bohlam H4 35/35W", kategori: "Lampu", harga_jual: 22000, harga_beli: 15000, stok: 15, stok_min: 5, is_jasa: false },
];

type DemoSale = { id: number; invoice_no: string; metode: string; total: number; created_at: string; qty: number; modal: number };
let products = DEMO_PRODUCTS.map((product) => ({ ...product }));
let sales: DemoSale[] = [
  { id: 3, invoice_no: "TRX-DEMO-003", metode: "QRIS", total: 283000, created_at: new Date(Date.now() - 1000 * 60 * 27).toISOString(), qty: 2, modal: 233000 },
  { id: 2, invoice_no: "TRX-DEMO-002", metode: "Tunai", total: 83000, created_at: new Date(Date.now() - 1000 * 60 * 88).toISOString(), qty: 2, modal: 66500 },
  { id: 1, invoice_no: "TRX-DEMO-001", metode: "Transfer", total: 165000, created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString(), qty: 1, modal: 135000 },
];

export function demoApi<T>(path: string, opts: { method?: string; body?: unknown } = {}): T {
  const method = (opts.method ?? "GET").toUpperCase();
  if (path === "/login" && method === "POST") {
    const body = opts.body as { email?: string; password?: string };
    if (body.email?.toLowerCase() !== DEMO_USER.email || body.password !== "password") throw new Error("Gunakan akun demo yang tertera di halaman masuk.");
    return { token: "showcase-demo-token", user: DEMO_USER } as T;
  }
  if (path === "/me" && method === "GET") return DEMO_USER as T;
  if (path === "/logout" && method === "POST") return { message: "Keluar dari demo" } as T;
  if (path === "/products" && method === "GET") return products.map((product) => ({ ...product })) as T;
  if (path === "/products" && method === "POST") {
    const form = opts.body as FormData;
    const product: Product = {
      id: Math.max(0, ...products.map((item) => item.id)) + 1,
      nama: String(form.get("nama") ?? "Produk demo"), sku: String(form.get("sku") ?? "DEMO"),
      barcode: String(form.get("barcode") ?? "") || null, kategori: String(form.get("kategori") ?? "Lainnya"),
      harga_jual: Number(form.get("harga_jual") ?? 0), harga_beli: Number(form.get("harga_beli") ?? 0),
      stok: Number(form.get("stok") ?? 0), stok_min: Number(form.get("stok_min") ?? 0), is_jasa: false,
    };
    products = [product, ...products];
    return product as T;
  }
  if (path === "/reports/today" && method === "GET") {
    return { omzet: sales.reduce((sum, sale) => sum + sale.total, 0), transaksi: sales.length, item: sales.reduce((sum, sale) => sum + sale.qty, 0), laba: sales.reduce((sum, sale) => sum + sale.total - sale.modal, 0), sales: sales.map(({ id, invoice_no, metode, total, created_at }) => ({ id, invoice_no, metode, total, created_at })) } as T;
  }
  if (path === "/sales" && method === "POST") {
    const body = opts.body as { items: { id: number; qty: number }[]; diskon?: number; metode: string; dibayar: number };
    const lines = body.items.map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product || item.qty <= 0 || (!product.is_jasa && item.qty > product.stok)) throw new Error("Stok demo tidak mencukupi.");
      return { product, qty: item.qty };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.product.harga_jual * line.qty, 0);
    const diskon = Math.min(subtotal, Math.max(0, Number(body.diskon ?? 0)));
    const total = subtotal - diskon;
    const dibayar = body.metode === "Tunai" ? Number(body.dibayar) : total;
    if (dibayar < total) throw new Error("Uang diterima kurang.");
    lines.forEach(({ product, qty }) => { if (!product.is_jasa) product.stok -= qty; });
    const id = sales.length ? Math.max(...sales.map((sale) => sale.id)) + 1 : 1;
    const invoice_no = `TRX-DEMO-${String(id).padStart(3, "0")}`;
    sales = [{ id, invoice_no, metode: body.metode, total, created_at: new Date().toISOString(), qty: lines.reduce((sum, line) => sum + line.qty, 0), modal: lines.reduce((sum, line) => sum + (line.product.harga_beli ?? 0) * line.qty, 0) }, ...sales];
    return { id, invoice_no, total, dibayar } as T;
  }
  const stockMatch = path.match(/^\/products\/(\d+)\/stock$/);
  if (stockMatch && method === "POST") {
    const product = products.find((entry) => entry.id === Number(stockMatch[1]));
    const body = opts.body as { qty: number };
    if (!product || product.stok + Number(body.qty) < 0) throw new Error("Jumlah stok demo tidak valid.");
    product.stok += Number(body.qty);
    return { ...product } as T;
  }
  throw new Error("Aksi ini tidak tersedia pada mode demo.");
}
