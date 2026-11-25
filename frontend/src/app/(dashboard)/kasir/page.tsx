"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";
import { NO_PRODUCT_PHOTO } from "@/lib/product-image";
import type { Product } from "@/lib/types";
import { LoadingText } from "@/components/LoadingText";
import { ProductImage } from "@/components/ProductImage";
import { SHOP } from "@/lib/shop";

type Line = { p: Product; qty: number };
type Receipt = { invoice_no: string; total: number; metode: string; dibayar: number; diskon: number; lines: Line[]; time: string };
const TRANSFER_BANKS = ["BCA", "BRI", "BNI", "Mandiri", "BSI"] as const;
type TransferBank = (typeof TRANSFER_BANKS)[number];
const EWALLET_PROVIDERS = ["DANA", "OVO", "GoPay", "ShopeePay"] as const;
type EWalletProvider = (typeof EWALLET_PROVIDERS)[number];

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
  const [bankTransfer, setBankTransfer] = useState<TransferBank>("BCA");
  const [eWallet, setEWallet] = useState<EWalletProvider>("DANA");
  const [terima, setTerima] = useState(0);
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [rcp, setRcp] = useState<Receipt | null>(null);
  const [selectedImage, setSelectedImage] = useState<Product | null>(null);
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
    const p = products.find((x) => !x.is_jasa && (x.barcode === code || x.sku.toLowerCase() === code.toLowerCase()));
    p ? add(p) : flash(`Barcode ${code} tidak ditemukan`, true);
  }

  async function bayar() {
    if (!cart.length || busy) return;
    if (metode === "Tunai" && terima < total) return flash("Uang diterima kurang", true);
    setBusy(true);
    const metodeTransaksi = metode === "Transfer bank" ? `Transfer ${bankTransfer}` : metode === "E-Wallet" ? `E-Wallet ${eWallet}` : metode;
    const dibayar = metode === "Tunai" ? terima : total;
    let data: { invoice_no: string; total: number };
    try {
      // Harga & stok dihitung ulang di server Laravel, bukan dipercaya dari browser.
      data = await api("/sales", { method: "POST", body: { items: cart.map((l) => ({ id: l.p.id, qty: l.qty })), diskon, metode: metodeTransaksi, dibayar } });
    } catch (e) { setBusy(false); return flash((e as Error).message, true); }
    setBusy(false);
    setRcp({ invoice_no: data.invoice_no, total: data.total, metode: metodeTransaksi, dibayar, diskon, lines: cart, time: new Date().toLocaleString("id-ID") });
    setCart([]); setDiskon(0); setTerima(0); load();
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); scanRef.current?.focus(); }
      if (e.key === "F4") { e.preventDefault(); bayar(); }
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const productStock = products.filter((p) => !p.is_jasa);
  const kats = ["Semua", ...Array.from(new Set(productStock.map((p) => p.kategori)))];
  const list = productStock.filter((p) => (kat === "Semua" || p.kategori === kat) && (p.nama + p.sku).toLowerCase().includes(q.toLowerCase()));

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
            <button key={p.id} onClick={() => add(p)} className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-card p-2 text-left hover:border-ac">
              <ProductImage productId={p.gambar_path ? p.id : undefined} demoSrc={p.demo_image} fallbackSrc={NO_PRODUCT_PHOTO} alt={`Foto ${p.nama}`} className="h-14 w-14 shrink-0 rounded-lg bg-bg" />
              <span className="min-w-0"><b className="block truncate text-sm">{p.nama}</b>
              <span className="block truncate text-xs text-mut">{p.sku}{p.is_jasa ? "" : ` · stok ${p.stok}`}</span>
              <span className="block font-bold text-ac">{rp(p.harga_jual)}</span></span>
            </button>
          ))}
          {!list.length && <p className="col-span-full py-8 text-center text-mut">Barang tidak ditemukan. Coba kata kunci lain.</p>}
        </div>
      </section>

      <section className="card flex flex-col">
        <b>Keranjang</b>
        <div className="my-3 flex-1">
          {cart.map((l) => (
            <div key={l.p.id} className="border-b border-line py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div role="button" tabIndex={0} className="group shrink-0 cursor-zoom-in rounded-xl focus:outline-none focus:ring-2 focus:ring-ac" onClick={() => setSelectedImage(l.p)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedImage(l.p); } }} aria-label={`Lihat foto ${l.p.nama} ukuran besar`}>
                  <ProductImage productId={l.p.gambar_path ? l.p.id : undefined} demoSrc={l.p.demo_image} fallbackSrc={NO_PRODUCT_PHOTO} alt={`Foto ${l.p.nama}`} className="h-16 w-16 rounded-xl bg-bg transition-transform group-hover:scale-105" />
                </div>
                <div className="min-w-0 flex-1"><b className="block truncate text-sm">{l.p.nama}</b><p className="text-xs text-mut">{rp(l.p.harga_jual)} × {l.qty}</p><b className="mt-1 block text-sm text-ac">{rp(l.qty * l.p.harga_jual)}</b></div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="mr-auto text-xs text-mut">Jumlah</span>
                <button className="btn !min-h-[32px] !px-3" aria-label={`Kurangi ${l.p.nama}`} onClick={() => ubah(l.p.id, -1)}>−</button><b className="min-w-6 text-center">{l.qty}</b>
                <button className="btn !min-h-[32px] !px-3" aria-label={`Tambah ${l.p.nama}`} onClick={() => add(l.p)}>+</button>
              </div>
            </div>
          ))}
          {!cart.length && <p className="py-8 text-center text-mut">Keranjang kosong. Scan barcode atau pilih barang.</p>}
        </div>
        <div className="flex justify-between text-sm text-mut"><span>Subtotal</span><span>{rp(sub)}</span></div>
        <div className="flex items-center justify-between text-sm text-mut"><span>Diskon (Rp)</span>
          <input type="number" min={0} className="input !min-h-[34px] !w-28 text-right" value={diskon || ""} onChange={(e) => setDiskon(Math.max(0, +e.target.value))} /></div>
        <div className="mt-1 flex justify-between text-xl font-extrabold"><span>Total</span><span>{rp(total)}</span></div>
        <label className="mt-3 text-sm text-mut">Metode pembayaran<select className="input mt-1" value={metode} onChange={(e) => setMetode(e.target.value)}><option>Tunai</option><option>Transfer bank</option><option>E-Wallet</option><option>QRIS</option></select></label>
        {metode === "Transfer bank" && (() => {
          const account = SHOP.pembayaran.rekening[bankTransfer];
          return <div className="mt-2 rounded-xl border border-line bg-bg p-3">
            <label className="text-sm text-mut">Pilih bank<select className="input mt-1" value={bankTransfer} onChange={(event) => setBankTransfer(event.target.value as TransferBank)}>{TRANSFER_BANKS.map((bank) => <option key={bank}>{bank}</option>)}</select></label>
            <div className="mt-3"><span className="text-xs text-mut">Nomor rekening {bankTransfer}</span><p className="select-all text-lg font-extrabold tracking-wide text-white">{account.nomor}</p><p className="text-xs text-mut">a.n. {account.atasNama}</p></div>
            {SHOP.pembayaran.demo && <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300">DATA DUMMY — jangan gunakan untuk transfer sungguhan.</p>}
          </div>;
        })()}
        {metode === "E-Wallet" && (() => {
          const wallet = SHOP.pembayaran.eWallet[eWallet];
          return <div className="mt-2 rounded-xl border border-line bg-bg p-3">
            <label className="text-sm text-mut">Pilih e-wallet<select className="input mt-1" value={eWallet} onChange={(event) => setEWallet(event.target.value as EWalletProvider)}>{EWALLET_PROVIDERS.map((provider) => <option key={provider}>{provider}</option>)}</select></label>
            <div className="mt-3"><span className="text-xs text-mut">Nomor akun {eWallet}</span><p className="select-all text-lg font-extrabold tracking-wide text-white">{wallet.nomor}</p><p className="text-xs text-mut">a.n. {wallet.atasNama}</p></div>
            {SHOP.pembayaran.demo && <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300">DATA DUMMY — jangan gunakan untuk pembayaran sungguhan.</p>}
          </div>;
        })()}
        {metode === "QRIS" && <div className="mt-2 rounded-xl border border-line bg-bg p-3 text-center">
          <p className="text-sm font-bold">{SHOP.pembayaran.demo ? "Scan QRIS demo" : "Scan QRIS untuk membayar"}</p>
          {SHOP.pembayaran.gambarQris ? <img src={SHOP.pembayaran.gambarQris} alt={SHOP.pembayaran.demo ? "QRIS dummy untuk simulasi" : "Kode QRIS pembayaran toko"} className="mx-auto mt-3 max-h-64 w-56 rounded-xl border border-line bg-white p-2 object-contain" /> : <p className="mt-3 rounded-lg border border-dashed border-line p-5 text-sm text-mut">Gambar QRIS belum diatur.</p>}
          {SHOP.pembayaran.demo && <p className="mt-2 text-xs font-bold text-amber-300">QR ini hanya dummy dan tidak dapat digunakan untuk membayar.</p>}
          <p className="mt-2 text-lg font-extrabold text-ac">{rp(total)}</p>
        </div>}
        {metode === "Tunai" && (<>
          <input type="number" className="input mt-2" placeholder="Uang diterima" value={terima || ""} onChange={(e) => setTerima(+e.target.value)} />
          <div className="mt-2 flex gap-2">
            {[total, 50000, 100000].map((n, i) => <button key={i} className="btn flex-1 !px-1 text-sm" onClick={() => setTerima(n)}>{i === 0 ? "Pas" : `${n / 1000}rb`}</button>)}
          </div>
          <p className="mt-2 flex justify-between text-sm"><span className="text-mut">Kembalian</span>
            <b className={terima < total ? "text-bad" : "text-ok"}>{terima < total ? `Kurang ${rp(total - terima)}` : rp(terima - total)}</b></p>
        </>)}
        <button className="btn-pri mt-3" disabled={!cart.length || busy} onClick={bayar}>{busy ? <LoadingText label="Memproses…" light /> : "Bayar (F4)"}</button>
        <button className="btn mt-2" disabled={!cart.length} onClick={() => { setCart([]); setDiskon(0); }}>Kosongkan</button>
      </section>

      {selectedImage && <div className="fixed inset-0 z-20 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="product-image-title" className="relative w-full max-w-xl rounded-2xl border border-line bg-card p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="product-image-title" className="truncate font-bold">{selectedImage.nama}</h2><button type="button" className="btn !min-h-9 !px-3" onClick={() => setSelectedImage(null)} aria-label="Tutup foto">✕</button></div>
          <ProductImage productId={selectedImage.gambar_path ? selectedImage.id : undefined} demoSrc={selectedImage.demo_image} fallbackSrc={NO_PRODUCT_PHOTO} alt={`Foto ${selectedImage.nama}`} className="mx-auto h-[min(65vh,520px)] w-full rounded-xl bg-bg" />
        </section>
      </div>}

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
