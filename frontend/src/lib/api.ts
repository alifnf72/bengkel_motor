const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// Pemanggil API Laravel. Token login disimpan di localStorage dan dikirim sebagai Bearer.
export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let res: Response;
  try {
    res = await fetch(API + path, {
      method: opts.method ?? "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Pastikan backend Laravel berjalan (php artisan serve).");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Terjadi kesalahan pada server.");
  return data as T;
}
