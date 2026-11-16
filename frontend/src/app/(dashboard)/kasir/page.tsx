"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";
import type { Product } from "@/lib/types";

type Line = { p: Product; qty: number };
type Receipt = { invoice_no: string; total: number; metode: string; dibayar: number; diskon: number; lines: Line[]; time: string };

function beep(ok: boolean) {
  try {
    const c = new AudioContext(), o = c.createOscillator();
    o.frequency.value = ok ? 880 : 220; o.connect(c.destination); o.start(); o.stop(c.currentTime + 0.1);
  } catch {}
}

export default function Kasir() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Line[]>([]);
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [diskon, setDiskon] = useState(0);
  const [metode, setMetode] = useState("Tunai");
  const [terima, setTerima] = useState(0);
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [rcp, setRcp] = useState<Receipt | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const flash = (t: string, err = false) => { setMsg({ t, err }); setTimeout(() => setMsg(null), 2500); if (err) beep(false); };

  const load = useCallback(async () => {
    try { setProducts(await api<Product[]>("/products")); }
    catch (e) { setMsg({ t: (e as Error).message, err: true }); }
  }, []);
  useEffect(() => { load(); scanRef.current?.focus(); }, [load]);

  const sub = cart.reduce((s, l) => s + l.qty * l.p.harga_jual, 0);
  const total = Math.max(0, sub - diskon);

  function add(p: Product) {
    const n = (cart.find((l) => l.p.id === p.id)?.qty ?? 0) + 1;
    if (!p.is_jasa && n > p.stok) return flash(`Stok ${p.nama} tidak cukup`, true);
    beep(true);
    setCart(cart.some((l) => l.p.id === p.id) ? cart.map((l) => (l.p.id === p.id ? { ...l, qty: n } : l)) : [...cart, { p, qty: 1 }]);
  }
  function ubah(id: number, d: number) {
    setCart(cart.map((l) => (l.p.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));
  }
  function scan(code: string) {
    code = code.trim(); if (!code) return;
    const p = products.find((x) => x.barcode === code || x.sku.toLowerCase() === code.toLowerCase());
    p ? add(p) : flash(`Barcode ${code} tidak ditemukan`, true);
  }

  async function bayar() {
    if (!cart.length || busy) return;
    if (metode === "Tunai" && terima < total) return flash("Uang diterima kurang", true);
    setBusy(true);
    const dibayar = metode === "Tunai" ? terima : total;
    let data: { invoice_no: string; total: number };
    try {
      // Harga & stok dihitung ulang di server Laravel, bukan dipercaya dari browser.
      data = await api("/sales", { method: "POST", body: { items: cart.map((l) => ({ id: l.p.id, qty: l.qty })), diskon, metode, dibayar } });
    } catch (e) { setBusy(false); return flash((e as Error).message, true); }
    setBusy(false);
    setRcp({ invoice_no: data.invoice_no, total: data.total, metode, dibayar, diskon, lines: cart, time: new Date().toLocaleString("id-ID") });
    setCart([]); setDiskon(0); setTerima(0); load();
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); scanRef.current?.focus(); }
      if (e.key === "F4") { e.preventDefault(); bayar(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const kats = ["Semua", ...Array.from(new Set(products.map((p) => p.kategori)))];
  const list = products.filter((p) => (kat === "Semua" || p.kategori === kat) && (p.nama + p.sku).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="card">
        <input ref={scanRef} className="input" placeholder="Scan barcode lalu Enter (F2)" autoComplete="off"
          onKeyDown={(e) => { if (e.key === "Enter") { scan(e.currentTarget.value); e.currentTarget.value = ""; } }} />
        <input className="input mt-2" placeholder="Cari nama atau SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          {kats.map((k) => <button key={k} onClick={() => setKat(k)} className={`rounded-full border px-3 py-1.5 text-sm ${k === kat ? "border-ac text-ac" : "border-line"}`}>{k}</button>)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {list.map((p) => (
            <button key={p.id} onClick={() => add(p)} className="rounded-xl border border-line bg-card p-3 text-left hover:border-ac">
              <b className="text-sm">{p.nama}</b>
              <p className="text-xs text-mut">{p.sku}{p.is_jasa ? "" : ` · stok ${p.stok}`}</p>
              <p className="font-bold text-ac">{rp(p.harga_jual)}</p>
            </button>
          ))}
          {!list.length && <p className="col-span-full py-8 text-center text-mut">Barang tidak ditemukan. Coba kata kunci lain.</p>}
        </div>
      </section>

      <section className="card flex flex-col">
        <b>Keranjang</b>
        <div className="my-3 flex-1">
          {cart.map((l) => (
            <div key={l.p.id} className="flex items-center justify-between gap-2 border-b border-line py-2">
              <div><b className="text-sm">{l.p.nama}</b><p className="text-xs text-mut">{rp(l.p.harga_jual)}</p></div>
              <div className="flex items-center gap-2">
                <button className="btn !min-h-[34px] !px-3" onClick={() => ubah(l.p.id, -1)}>−</button>{l.qty}
                <button className="btn !min-h-[34px] !px-3" onClick={() => add(l.p)}>+</button>
              </div>
              <b className="w-24 text-right text-sm">{rp(l.qty * l.p.harga_jual)}</b>
            </div>
          ))}
          {!cart.length && <p className="py-8 text-center text-mut">Keranjang kosong. Scan barcode atau pilih barang.</p>}
        </div>
        <div className="flex justify-between text-sm text-mut"><span>Subtotal</span><span>{rp(sub)}</span></div>
        <div className="flex items-center justify-between text-sm text-mut"><span>Diskon (Rp)</span>
          <input type="number" min={0} className="input !min-h-[34px] !w-28 text-right" value={diskon || ""} onChange={(e) => setDiskon(Math.max(0, +e.target.value))} /></div>
        <div className="mt-1 flex justify-between text-xl font-extrabold"><span>Total</span><span>{rp(total)}</span></div>
        <select className="input mt-3" value={metode} onChange={(e) => setMetode(e.target.value)}><option>Tunai</option><option>Transfer</option><option>QRIS</option></select>
        {metode === "Tunai" && (<>
          <input type="number" className="input mt-2" placeholder="Uang diterima" value={terima || ""} onChange={(e) => setTerima(+e.target.value)} />
          <div className="mt-2 flex gap-2">
            {[total, 50000, 100000].map((n, i) => <button key={i} className="btn flex-1 !px-1 text-sm" onClick={() => setTerima(n)}>{i === 0 ? "Pas" : `${n / 1000}rb`}</button>)}
          </div>
          <p className="mt-2 flex justify-between text-sm"><span className="text-mut">Kembalian</span>
            <b className={terima < total ? "text-bad" : "text-ok"}>{terima < total ? `Kurang ${rp(total - terima)}` : rp(terima - total)}</b></p>
        </>)}
        <button className="btn-pri mt-3" disabled={!cart.length || busy} onClick={bayar}>{busy ? "Memproses…" : "Bayar (F4)"}</button>
        <button className="btn mt-2" disabled={!cart.length} onClick={() => { setCart([]); setDiskon(0); }}>Kosongkan</button>
      </section>

      {msg && <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-white ${msg.err ? "bg-bad" : "bg-ok"}`}>{msg.t}</div>}

      {rcp && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/60 p-4">
          <div className="card w-full max-w-sm">
            <b className="text-ok">Transaksi berhasil</b>
            <pre className="receipt my-3 whitespace-pre-wrap rounded-lg bg-white p-3 font-mono text-xs text-black">{
`BENGKEL MOTOR\n${rcp.invoice_no}\n${rcp.time}\n--------------------------------\n` +
rcp.lines.map((l) => `${l.qty}x ${l.p.nama}\n   ${rp(l.p.harga_jual * l.qty)}`).join("\n") +
`\n--------------------------------\n` + (rcp.diskon ? `Diskon  -${rp(rcp.diskon)}\n` : "") +
`TOTAL   ${rp(rcp.total)}\n${rcp.metode.padEnd(8)}${rp(rcp.dibayar)}\n` +
(rcp.metode === "Tunai" ? `Kembali ${rp(rcp.dibayar - rcp.total)}\n` : "") + `\nTerima kasih`}</pre>
            <div className="flex gap-2">
              <button className="btn flex-1" onClick={() => window.print()}>Cetak struk</button>
              <button className="btn-pri flex-1" onClick={() => { setRcp(null); scanRef.current?.focus(); }}>Transaksi baru</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
