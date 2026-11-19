"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, apiBlob } from "@/lib/api";
import { rp } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import type { Product } from "@/lib/types";

const kosong = { nama: "", sku: "", barcode: "", kategori: "Lainnya", harga_jual: "", harga_beli: "", stok: "", stok_min: "5" };
export default function Stok() {
  const [rows, setRows] = useState<Product[]>([]);
  const [form, setForm] = useState(kosong);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState("Semua kategori");
  const [status, setStatus] = useState("Semua status");
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    try { setRows((await api<Product[]>("/products")).filter((p) => !p.is_jasa)); }
    catch (e) { setMsg((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const showBeli = rows.some((r) => r.harga_beli !== undefined);
  const low = rows.filter((r) => r.stok > 0 && r.stok <= r.stok_min).length;
  const out = rows.filter((r) => r.stok === 0).length;
  const categories = useMemo(() => ["Semua kategori", ...Array.from(new Set(rows.map((r) => r.kategori))).sort()], [rows]);
  const visible = useMemo(() => rows.filter((r) => {
    const matchesText = `${r.nama} ${r.sku} ${r.barcode ?? ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = kategori === "Semua kategori" || r.kategori === kategori;
    const matchesStatus = status === "Semua status" || (status === "Aman" && r.stok > r.stok_min) || (status === "Menipis" && r.stok > 0 && r.stok <= r.stok_min) || (status === "Habis" && r.stok === 0);
    return matchesText && matchesCategory && matchesStatus;
  }), [rows, query, kategori, status]);

  useEffect(() => {
    let active = true;
    let created: string[] = [];
    setImageUrls({});
    Promise.all(visible.filter((r) => r.gambar_path).map(async (r) => {
      try { return [r.id, URL.createObjectURL(await apiBlob(`/products/${r.id}/image`))] as const; }
      catch { return null; }
    })).then((items) => {
      const pairs = items.filter((item): item is readonly [number, string] => item !== null);
      created = pairs.map(([, url]) => url);
      if (active) setImageUrls(Object.fromEntries(pairs));
      else created.forEach(URL.revokeObjectURL);
    });
    return () => { active = false; created.forEach(URL.revokeObjectURL); };
  }, [visible]);

  async function simpan(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); setBusy(true);
    try {
      const body = new FormData();
      body.set("nama", form.nama); body.set("sku", form.sku); body.set("barcode", form.barcode);
      body.set("kategori", form.kategori); body.set("harga_jual", form.harga_jual);
      body.set("harga_beli", form.harga_beli || "0"); body.set("stok", form.stok || "0"); body.set("stok_min", form.stok_min || "0");
      if (imageFile) body.set("gambar", imageFile);
      await api("/products", { method: "POST", body });
      setForm(kosong); setImageFile(null); setPreview(""); setOpen(false); await load();
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  }

  async function masuk(r: Product) {
    const answer = window.prompt(`Jumlah barang masuk untuk ${r.nama}:`, "1");
    if (answer === null) return;
    const qty = Number(answer);
    if (!Number.isInteger(qty) || qty <= 0) { setMsg("Jumlah barang masuk harus berupa bilangan bulat lebih dari 0."); return; }
    try { await api(`/products/${r.id}/stock`, { method: "POST", body: { qty, alasan: "Barang masuk" } }); await load(); setMsg(`${r.nama}: stok berhasil diperbarui.`); }
    catch (e) { setMsg((e as Error).message); }
  }
  const set = (k: keyof typeof kosong) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [k]: e.target.value }));
  const statusLabel = (r: Product) => r.stok === 0 ? { text: "Habis", cls: "bg-red-50 text-red-700" } : r.stok <= r.stok_min ? { text: "Menipis", cls: "bg-amber-50 text-amber-700" } : { text: "Aman", cls: "bg-emerald-50 text-emerald-700" };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-[#172923] p-6 text-white md:p-8">
        <div className="relative z-10 max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a9c9b2]">Inventaris bengkel</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Stok barang</h1><p className="mt-2 text-sm leading-6 text-white/65">Pantau ketersediaan sparepart dan catat barang masuk dari satu tempat.</p><button className="mt-5 rounded-full bg-[#f06443] px-5 py-3 text-sm font-bold text-white" onClick={() => setOpen(true)}>＋ Tambah produk</button></div>
        <img src="/images/workshop.svg" alt="Ilustrasi ruang bengkel" className="absolute -right-2 top-0 hidden h-full w-[48%] object-cover opacity-35 md:block" />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Total produk", value: rows.length, icon: "▦", color: "text-slate-700", tint: "bg-slate-100" }, { label: "Stok menipis", value: low, icon: "!", color: "text-amber-700", tint: "bg-amber-100" }, { label: "Stok habis", value: out, icon: "×", color: "text-red-700", tint: "bg-red-100" }].map((item) => <article key={item.label} className="rounded-2xl border border-line bg-card p-4"><div className="flex items-center justify-between"><span className="text-sm text-mut">{item.label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl font-bold ${item.color} ${item.tint}`}>{item.icon}</span></div><p className="mt-3 text-3xl font-extrabold">{item.value}</p></article>)}
      </section>

      {msg && <div className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-sm"><span>{msg}</span><button aria-label="Tutup pesan" onClick={() => setMsg("")} className="ml-4 text-mut">✕</button></div>}
      <section className="overflow-hidden rounded-3xl border border-line bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-4 md:p-5"><div><h2 className="text-lg font-bold">Daftar produk</h2><p className="mt-1 text-sm text-mut">Menampilkan {visible.length} dari {rows.length} produk</p></div><div className="flex flex-wrap gap-2"><input className="input !min-h-[40px] md:w-64" aria-label="Cari produk" placeholder="Cari nama, SKU, barcode…" value={query} onChange={(e) => setQuery(e.target.value)} /><select className="input !min-h-[40px] md:w-auto" value={kategori} onChange={(e) => setKategori(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select><select className="input !min-h-[40px] md:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>{["Semua status", "Aman", "Menipis", "Habis"].map((s) => <option key={s}>{s}</option>)}</select></div></div>
        {visible.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((r) => { const badge = statusLabel(r); return <article key={r.id} className="overflow-hidden rounded-2xl border border-line bg-bg/60"><div className="relative"><img src={imageUrls[r.id] ?? productImage(r.kategori)} alt={imageUrls[r.id] ? `Foto ${r.nama}` : `Gambar contoh kategori ${r.kategori}`} className="h-36 w-full object-cover" /><span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>{badge.text}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold">{r.nama}</h3><p className="mt-1 text-xs text-mut">{r.kategori} · SKU {r.sku}</p></div><span className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-sm font-bold">{r.stok} <small className="font-normal text-mut">unit</small></span></div><div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm"><div><p className="text-xs text-mut">Harga jual</p><b>{rp(r.harga_jual)}</b></div>{showBeli && <div><p className="text-xs text-mut">Harga beli</p><b>{rp(r.harga_beli ?? 0)}</b></div>}</div>{r.barcode && <p className="mt-3 text-xs text-mut">Barcode: {r.barcode}</p>}<button className="btn mt-4 w-full !min-h-[38px] text-sm" onClick={() => masuk(r)}>＋ Catat barang masuk</button></div></article>; })}</div> : <div className="p-12 text-center"><div className="text-4xl">🔎</div><p className="mt-3 font-bold">Produk tidak ditemukan</p><p className="mt-1 text-sm text-mut">Ubah kata kunci atau filter yang dipilih.</p></div>}
      </section>

      {open && <div className="fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="form-title" className="my-auto w-full max-w-2xl rounded-3xl border border-line bg-card p-5 shadow-2xl md:p-7"><div className="mb-5 flex items-start justify-between"><div><h2 id="form-title" className="text-xl font-bold">Tambah produk</h2><p className="mt-1 text-sm text-mut">Masukkan informasi sparepart, stok awal, dan foto dari perangkat Anda.</p></div><button className="btn !min-h-9 !px-3" onClick={() => setOpen(false)} aria-label="Tutup form">✕</button></div><form onSubmit={simpan} className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-mut sm:col-span-2">Foto produk (JPG, PNG, atau WebP · maks. 3 MB)<input className="input mt-1 cursor-pointer py-2" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0] ?? null; setImageFile(file); setPreview(file ? URL.createObjectURL(file) : ""); }} />{preview && <img src={preview} alt="Pratinjau foto produk" className="mt-3 h-36 w-48 rounded-xl border border-line object-cover" />}</label><label className="text-sm text-mut">Nama produk<input className="input mt-1" placeholder="Contoh: Oli mesin 10W-40" required value={form.nama} onChange={set("nama")} /></label><label className="text-sm text-mut">SKU<input className="input mt-1" placeholder="Contoh: OLI-001" required value={form.sku} onChange={set("sku")} /></label><label className="text-sm text-mut">Barcode (opsional)<input className="input mt-1" placeholder="Scan atau ketik barcode" value={form.barcode} onChange={set("barcode")} /></label><label className="text-sm text-mut">Kategori<input className="input mt-1" placeholder="Oli, Aki, Rem…" required value={form.kategori} onChange={set("kategori")} /></label><label className="text-sm text-mut">Harga jual (Rp)<input className="input mt-1" type="number" min="0" required value={form.harga_jual} onChange={set("harga_jual")} /></label>{showBeli && <label className="text-sm text-mut">Harga beli (Rp)<input className="input mt-1" type="number" min="0" value={form.harga_beli} onChange={set("harga_beli")} /></label>}<label className="text-sm text-mut">Stok awal<input className="input mt-1" type="number" min="0" value={form.stok} onChange={set("stok")} /></label><label className="text-sm text-mut">Batas stok menipis<input className="input mt-1" type="number" min="0" value={form.stok_min} onChange={set("stok_min")} /></label><div className="mt-2 flex gap-2 sm:col-span-2"><button type="button" className="btn flex-1" onClick={() => setOpen(false)}>Batal</button><button className="btn-pri flex-1" disabled={busy}>{busy ? "Menyimpan…" : "Simpan produk"}</button></div></form></section></div>}
    </div>
  );
}
