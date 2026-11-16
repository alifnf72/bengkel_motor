"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";
import type { Product } from "@/lib/types";

const kosong = { nama: "", sku: "", barcode: "", kategori: "Lainnya", harga_jual: "", harga_beli: "", stok: "", stok_min: "5" };

export default function Stok() {
  const [rows, setRows] = useState<Product[]>([]);
  const [form, setForm] = useState(kosong);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try { setRows((await api<Product[]>("/products")).filter((p) => !p.is_jasa)); }
    catch (e) { setMsg((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const showBeli = rows.some((r) => r.harga_beli !== undefined); // hanya admin yang menerima harga beli

  async function simpan(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try {
      await api("/products", { method: "POST", body: {
        nama: form.nama, sku: form.sku, barcode: form.barcode || null, kategori: form.kategori,
        harga_jual: +form.harga_jual, harga_beli: +form.harga_beli || 0, stok: +form.stok || 0, stok_min: +form.stok_min || 0,
      } });
      setForm(kosong); setOpen(false); load();
    } catch (e) { setMsg((e as Error).message); }
  }

  async function masuk(r: Product) {
    const n = Number(prompt(`Barang masuk untuk ${r.nama}: berapa unit?`));
    if (!n || n <= 0) return;
    try { await api(`/products/${r.id}/stock`, { method: "POST", body: { qty: n, alasan: "Barang masuk" } }); load(); }
    catch (e) { setMsg((e as Error).message); }
  }

  const set = (k: keyof typeof kosong) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <b>Daftar stok</b>
        <button className="btn-pri" onClick={() => setOpen(!open)}>{open ? "Tutup" : "Tambah produk"}</button>
      </div>
      {msg && <p className="mb-3 text-sm text-bad">{msg}</p>}
      {open && (
        <form onSubmit={simpan} className="mb-4 grid gap-2 md:grid-cols-4">
          <input className="input" placeholder="Nama produk" required value={form.nama} onChange={set("nama")} />
          <input className="input" placeholder="SKU" required value={form.sku} onChange={set("sku")} />
          <input className="input" placeholder="Barcode (opsional)" value={form.barcode} onChange={set("barcode")} />
          <input className="input" placeholder="Kategori" value={form.kategori} onChange={set("kategori")} />
          <input className="input" type="number" placeholder="Harga jual" required value={form.harga_jual} onChange={set("harga_jual")} />
          <input className="input" type="number" placeholder="Harga beli" value={form.harga_beli} onChange={set("harga_beli")} />
          <input className="input" type="number" placeholder="Stok awal" value={form.stok} onChange={set("stok")} />
          <input className="input" type="number" placeholder="Stok minimum" value={form.stok_min} onChange={set("stok_min")} />
          <button className="btn-pri md:col-span-4">Simpan produk</button>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-mut"><tr><th className="p-2">Nama</th><th>SKU</th><th>Barcode</th><th>Stok</th>{showBeli && <th>Harga beli</th>}<th>Harga jual</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="p-2">{r.nama}</td><td>{r.sku}</td><td>{r.barcode}</td><td>{r.stok}</td>
                {showBeli && <td>{rp(r.harga_beli ?? 0)}</td>}
                <td>{rp(r.harga_jual)}</td>
                <td>{r.stok === 0 ? <span className="text-bad">Habis</span> : r.stok <= r.stok_min ? <span className="text-warn">Stok menipis</span> : <span className="text-ok">Aman</span>}</td>
                <td><button className="btn !min-h-[34px] text-xs" onClick={() => masuk(r)}>+ Masuk</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="py-8 text-center text-mut">Belum ada produk. Klik Tambah produk untuk memulai.</p>}
      </div>
    </div>
  );
}
