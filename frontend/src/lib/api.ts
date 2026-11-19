const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// Pemanggil API Laravel. Token login disimpan di localStorage dan dikirim sebagai Bearer.
export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let res: Response;
  try {
    res = await fetch(API + path, {
      method: opts.method ?? "GET",
      headers: { Accept: "application/json", ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Pastikan backend Laravel berjalan (php artisan serve).");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Terjadi kesalahan pada server.");
  return data as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let res: Response;
  try {
    res = await fetch(API + path, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: "no-store" });
  } catch {
    throw new Error("Tidak bisa terhubung ke server.");
  }
  if (!res.ok) throw new Error("Gambar produk tidak dapat dimuat.");
  return res.blob();
}
