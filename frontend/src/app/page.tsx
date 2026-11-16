import Link from "next/link";
import { SHOP } from "@/lib/shop";
import { rp } from "@/lib/format";

export const dynamic = "force-dynamic";

type Pub = { id: number; nama: string; kategori: string; harga_jual: number; is_jasa: boolean; tersedia: boolean };

// Katalog publik dari Laravel (/api/public/products), tanpa harga beli.
async function getProducts(): Promise<Pub[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/public/products`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return ((await res.json()) as Pub[]).filter((p) => !p.is_jasa).slice(0, 12);
  } catch { return []; }
}

export default async function Home() {
  const products = await getProducts();
  return (
    <div className="mx-auto max-w-5xl px-5">
      <header className="flex flex-wrap items-center justify-between gap-3 py-4">
        <b>🏍️ {SHOP.nama}</b>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-mut">
          <a href="#tentang">Tentang</a><a href="#layanan">Layanan</a><a href="#katalog">Katalog</a><a href="#kontak">Kontak</a>
          <Link href="/login" className="btn-pri flex items-center">Masuk kasir</Link>
        </nav>
      </header>

      <section className="py-14">
        <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{SHOP.tagline}</h1>
        <p className="mt-4 max-w-lg text-mut">Servis cepat, sparepart asli, dan harga yang dijelaskan di depan. Datang langsung atau tanya dulu lewat WhatsApp.</p>
        <a className="btn-pri mt-6 inline-flex items-center" href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noopener noreferrer">Tanya via WhatsApp</a>
      </section>

      <section id="tentang" className="border-t border-line py-8">
        <h2 className="mb-4 text-2xl font-bold">Tentang kami</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[["Sejak 2012", "Dimulai dari bengkel kecil, kini melayani ratusan pelanggan tetap setiap bulan."],
            ["Mekanik berpengalaman", "Terbiasa menangani motor matic, bebek, dan sport harian."],
            ["Garansi servis", "Garansi 7 hari untuk setiap pengerjaan. Jika masih bermasalah, kami kerjakan ulang."]].map(([t, d]) => (
            <div key={t} className="card"><b>{t}</b><p className="mt-1 text-sm text-mut">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="layanan" className="border-t border-line py-8">
        <h2 className="mb-4 text-2xl font-bold">Layanan</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {SHOP.layanan.map((l) => (
            <div key={l.nama} className="card"><b>{l.nama}</b><p className="mt-1 text-sm text-mut">{l.desc}</p><p className="mt-3 text-sm font-semibold text-ac">{l.harga}</p></div>
          ))}
        </div>
      </section>

      <section id="katalog" className="border-t border-line py-8">
        <h2 className="mb-4 text-2xl font-bold">Sparepart tersedia</h2>
        {products.length === 0 ? (
          <p className="text-mut">Katalog belum tampil. Pastikan backend Laravel sudah berjalan dan data contoh sudah dimasukkan (php artisan migrate --seed).</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="card">
                <b>{p.nama}</b><p className="text-sm text-mut">{p.kategori}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-ac">{rp(p.harga_jual)}</span>
                  <span className={`text-xs ${p.tersedia ? "text-ok" : "text-bad"}`}>{p.tersedia ? "Tersedia" : "Habis"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="kontak" className="border-t border-line py-8">
        <h2 className="mb-4 text-2xl font-bold">Kontak dan lokasi</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card"><b>Alamat</b><p className="text-sm text-mut">{SHOP.alamat}</p></div>
          <div className="card"><b>Jam buka</b><p className="text-sm text-mut">{SHOP.jam}</p></div>
          <div className="card"><b>WhatsApp</b><p className="text-sm text-mut">{SHOP.telp}</p></div>
        </div>
      </section>
      <footer className="border-t border-line py-6 text-sm text-mut">© 2026 {SHOP.nama}</footer>
    </div>
  );
}
