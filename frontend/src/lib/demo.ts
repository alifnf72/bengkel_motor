import type { Product, ShopProfile, User } from "@/lib/types";
import { SHOP } from "@/lib/shop";

export const DEMO_USER: User = { id: 1, name: "Pemilik Demo", email: "admin@bengkel.test", role: "admin" };
let shopProfile: ShopProfile = { ...SHOP, highlights: SHOP.highlights.map((item) => ({ ...item })) };

function getShopProfile(): ShopProfile {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem("bengkel_demo_shop_profile");
      if (saved) shopProfile = JSON.parse(saved) as ShopProfile;
    } catch {}
  }
  return { ...shopProfile, highlights: shopProfile.highlights.map((item) => ({ ...item })) };
}

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

type DemoSale = { id: number; invoice_no: string; metode: string; total: number; created_at: string; qty: number; modal: number; subtotal?: number; diskon?: number; dibayar?: number; items?: { nama: string; qty: number; harga: number; harga_beli?: number }[] };
const receiptFields = (sale: DemoSale) => ({
  id: sale.id, invoice_no: sale.invoice_no, metode: sale.metode, total: sale.total, created_at: sale.created_at,
  subtotal: sale.subtotal ?? sale.total, diskon: sale.diskon ?? 0, dibayar: sale.dibayar ?? sale.total,
  items: sale.items ?? [{ nama: "Barang demo", qty: sale.qty, harga: Math.round((sale.subtotal ?? sale.total) / Math.max(1, sale.qty)), harga_beli: Math.round(sale.modal / Math.max(1, sale.qty)) }],
});
let products = DEMO_PRODUCTS.map((product) => ({ ...product }));
let sales: DemoSale[] = [
  { id: 3, invoice_no: "TRX-DEMO-003", metode: "QRIS", total: 283000, created_at: new Date(Date.now() - 1000 * 60 * 27).toISOString(), qty: 5, modal: 229000, items: [{ nama: "Ban Luar 80/90-14", qty: 1, harga: 235000, harga_beli: 195000 }, { nama: "Oli Gardan 120ml", qty: 4, harga: 12000, harga_beli: 8500 }] },
  { id: 2, invoice_no: "TRX-DEMO-002", metode: "Tunai", total: 83000, dibayar: 100000, created_at: new Date(Date.now() - 1000 * 60 * 88).toISOString(), qty: 2, modal: 64000, items: [{ nama: "Oli Mesin 0.8L MPX2", qty: 1, harga: 48000, harga_beli: 38000 }, { nama: "Kampas Rem Depan Beat", qty: 1, harga: 35000, harga_beli: 26000 }] },
  { id: 1, invoice_no: "TRX-DEMO-001", metode: "Transfer", total: 165000, created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString(), qty: 1, modal: 135000, items: [{ nama: "Aki GS Astra 3.5Ah", qty: 1, harga: 165000, harga_beli: 135000 }] },
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
  if ((path === "/public/shop" || path === "/shop-settings") && method === "GET") return getShopProfile() as T;
  if (path === "/shop-settings" && method === "PUT") {
    shopProfile = { ...(opts.body as ShopProfile), highlights: (opts.body as ShopProfile).highlights.map((item) => ({ ...item })) };
    if (typeof window !== "undefined") window.localStorage.setItem("bengkel_demo_shop_profile", JSON.stringify(shopProfile));
    return getShopProfile() as T;
  }
  if (path === "/public/products" && method === "GET") return products.filter((product) => !product.is_jasa).map((product) => ({
    id: product.id, nama: product.nama, kategori: product.kategori, harga_jual: product.harga_jual,
    is_jasa: product.is_jasa, tersedia: product.stok > 0, gambar_url: product.demo_image ?? null,
  })) as T;
  if (path === "/products" && method === "GET") return products.map((product) => ({ ...product })) as T;
  if (path === "/products" && method === "POST") {
    const form = opts.body as FormData;
    const product: Product = {
      id: Math.max(0, ...products.map((item) => item.id)) + 1,
      nama: String(form.get("nama") ?? "Produk demo"), sku: String(form.get("sku") ?? "DEMO"),
      barcode: String(form.get("barcode") ?? "") || null, kategori: String(form.get("kategori") ?? "Lainnya"),
      harga_jual: Number(form.get("harga_jual") ?? 0), harga_beli: Number(form.get("harga_beli") ?? 0),
      stok: Number(form.get("stok") ?? 0), stok_min: Number(form.get("stok_min") ?? 0), is_jasa: false,
      demo_image: String(form.get("gambar_data") ?? "") || undefined,
    };
    products = [product, ...products];
    return product as T;
  }
  const productMatch = path.match(/^\/products\/(\d+)$/);
  if (productMatch && method === "DELETE") {
    const id = Number(productMatch[1]);
    if (!products.some((item) => item.id === id)) throw new Error("Produk tidak ditemukan.");
    products = products.filter((item) => item.id !== id);
    return { message: "Produk berhasil dihapus." } as T;
  }
  if (productMatch && method === "PUT") {
    const product = products.find((item) => item.id === Number(productMatch[1]));
    if (!product) throw new Error("Produk tidak ditemukan.");
    const form = opts.body as FormData;
    Object.assign(product, {
      nama: String(form.get("nama") ?? product.nama), sku: String(form.get("sku") ?? product.sku),
      barcode: String(form.get("barcode") ?? product.barcode ?? "") || null,
      kategori: String(form.get("kategori") ?? product.kategori), harga_jual: Number(form.get("harga_jual") ?? product.harga_jual),
      harga_beli: Number(form.get("harga_beli") ?? product.harga_beli ?? 0), stok_min: Number(form.get("stok_min") ?? product.stok_min),
      demo_image: String(form.get("gambar_data") ?? "") || product.demo_image,
    });
    return { ...product } as T;
  }
  if (path === "/reports/today" && method === "GET") {
    const dateKey = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
    const today = dateKey(new Date().toISOString());
    const todaysSales = sales.filter((sale) => dateKey(sale.created_at) === today);
    const kotor = todaysSales.reduce((sum, sale) => sum + (sale.subtotal ?? sale.total), 0);
    const net = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const modal = todaysSales.reduce((sum, sale) => sum + sale.modal, 0);
    return { omzet: net, pendapatan_kotor: kotor, diskon: kotor - net, modal, pendapatan_bersih: net, transaksi: todaysSales.length, item: todaysSales.reduce((sum, sale) => sum + sale.qty, 0), laba: net - modal, sales: todaysSales.map(receiptFields) } as T;
  }
  if (path.startsWith("/reports/range?") && method === "GET") {
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    const from = params.get("dari") ?? "";
    const to = params.get("sampai") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) throw new Error("Rentang tanggal laporan tidak valid.");
    const dateKey = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
    const selected = sales.filter((sale) => { const date = dateKey(sale.created_at); return date >= from && date <= to; });
    const details = selected.map(receiptFields);
    const kotor = selected.reduce((sum, sale) => sum + (sale.subtotal ?? sale.total), 0);
    const net = selected.reduce((sum, sale) => sum + sale.total, 0);
    const modal = selected.reduce((sum, sale) => sum + sale.modal, 0);
    return {
      omzet: net,
      pendapatan_kotor: kotor,
      diskon: kotor - net,
      modal,
      pendapatan_bersih: net,
      transaksi: selected.length,
      item: selected.reduce((sum, sale) => sum + sale.qty, 0),
      laba: net - modal,
      sales: details,
    } as T;
  }
  if (path.startsWith("/reports/sales-trend") && method === "GET") {
    const requested = Number(new URLSearchParams(path.split("?")[1] ?? "").get("days") ?? 7);
    const days = [7, 30, 90].includes(requested) ? requested : 7;
    const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const daily = new Map<string, { omzet: number; transaksi: number }>();
    sales.forEach((sale) => {
      const key = dateKey(new Date(sale.created_at));
      const current = daily.get(key) ?? { omzet: 0, transaksi: 0 };
      daily.set(key, { omzet: current.omzet + sale.total, transaksi: current.transaksi + 1 });
    });
    const now = new Date();
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + index + 1);
      const tanggal = dateKey(date);
      return { tanggal, ...(daily.get(tanggal) ?? { omzet: 0, transaksi: 0 }) };
    }) as T;
  }
  if (path === "/reports/history" && method === "GET") {
    const dateKey = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
    const today = dateKey(new Date().toISOString());
    const groups = new Map<string, DemoSale[]>();
    sales.filter((sale) => dateKey(sale.created_at) < today).forEach((sale) => groups.set(dateKey(sale.created_at), [...(groups.get(dateKey(sale.created_at)) ?? []), sale]));
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([tanggal, daySales]) => ({
      tanggal, omzet: daySales.reduce((sum, sale) => sum + sale.total, 0), pendapatan_kotor: daySales.reduce((sum, sale) => sum + (sale.subtotal ?? sale.total), 0),
      diskon: daySales.reduce((sum, sale) => sum + (sale.subtotal ?? sale.total) - sale.total, 0), modal: daySales.reduce((sum, sale) => sum + sale.modal, 0),
      pendapatan_bersih: daySales.reduce((sum, sale) => sum + sale.total, 0), transaksi: daySales.length,
      item: daySales.reduce((sum, sale) => sum + sale.qty, 0), laba: daySales.reduce((sum, sale) => sum + sale.total - sale.modal, 0),
      sales: daySales.map(receiptFields),
    })) as T;
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
    sales = [{ id, invoice_no, metode: body.metode, total, created_at: new Date().toISOString(), subtotal, diskon, dibayar, qty: lines.reduce((sum, line) => sum + line.qty, 0), modal: lines.reduce((sum, line) => sum + (line.product.harga_beli ?? 0) * line.qty, 0), items: lines.map(({ product, qty }) => ({ nama: product.nama, qty, harga: product.harga_jual, harga_beli: product.harga_beli ?? 0 })) }, ...sales];
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
