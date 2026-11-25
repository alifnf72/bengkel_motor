"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";
import type { Product, User } from "@/lib/types";
import { LoadingText } from "@/components/LoadingText";

type Sale = { id: number; invoice_no: string; metode: string; total: number; created_at: string };
type Report = { omzet: number; transaksi: number; item: number; laba: number; sales: Sale[] };
type TrendPoint = { tanggal: string; omzet: number; transaksi: number };

const shortcuts = [
  { href: "/kasir", title: "Buka kasir", description: "Catat penjualan dan cetak struk", icon: "↗" },
  { href: "/stok", title: "Kelola stok", description: "Lihat produk dan catat barang masuk", icon: "▦" },
  { href: "/laporan", title: "Lihat laporan", description: "Periksa penjualan hari ini dan riwayat", icon: "▤" },
  { href: "/", title: "Profil bengkel", description: "Lihat katalog publik bengkel", icon: "⌂" },
];

export default function DashboardAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [days, setDays] = useState(7);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<User>("/me").then((current) => {
      if (!active) return;
      if (current.role !== "admin") { router.replace("/kasir"); return; }
      setUser(current);
      return Promise.all([api<Report>("/reports/today"), api<Product[]>("/products")]);
    }).then((data) => {
      if (active && data) { setReport(data[0]); setProducts(data[1].filter((product) => !product.is_jasa)); }
    }).catch((e) => { if (active) setError((e as Error).message); });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    api<TrendPoint[]>(`/reports/sales-trend?days=${days}`).then(setTrend).catch((e) => setError((e as Error).message));
  }, [user, days]);

  if (!user && !error) return <div className="grid min-h-[35vh] place-items-center"><LoadingText label="Memuat dashboard…" /></div>;
  const low = products.filter((product) => product.stok > 0 && product.stok <= product.stok_min);
  const empty = products.filter((product) => product.stok === 0);
  const chart = (() => {
    const width = 900, height = 300, left = 76, right = 20, top = 24, bottom = 38;
    const max = Math.max(1, ...trend.map((point) => point.omzet));
    const step = 10 ** Math.floor(Math.log10(max));
    const ceiling = Math.ceil(max / step) * step || 1;
    const x = (index: number) => left + index * (width - left - right) / Math.max(1, trend.length - 1);
    const y = (value: number) => top + (ceiling - value) / ceiling * (height - top - bottom);
    const points = trend.map((point, index) => `${x(index)},${y(point.omzet)}`);
    const line = points.length ? `M ${points.join(" L ")}` : "";
    const area = points.length ? `${line} L ${x(trend.length - 1)},${height - bottom} L ${x(0)},${height - bottom} Z` : "";
    return { width, height, left, right, top, bottom, ceiling, x, y, line, area };
  })();
  const peak = trend.reduce((best, point) => point.omzet > best.omzet ? point : best, { tanggal: "", omzet: 0, transaksi: 0 });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-3xl bg-[#172923] p-6 text-white md:p-8">
        <p className="text-sm text-white/70">Ringkasan operasional</p>
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Dashboard Admin</h1>
        <p className="mt-2 text-sm text-white/75">Selamat datang{user ? `, ${user.name}` : ""}. Pantau penjualan dan kondisi stok bengkel hari ini.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Penjualan hari ini</h2><p className="text-sm text-mut">Hanya transaksi yang sudah selesai</p></div><Link href="/laporan" className="text-sm font-semibold text-ac">Buka laporan →</Link></div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[["Omzet", rp(report?.omzet ?? 0)], ["Transaksi", report?.transaksi ?? 0], ["Item terjual", report?.item ?? 0], ["Laba kotor", rp(report?.laba ?? 0)]].map(([label, value]) => <article key={label} className="card"><p className="text-sm text-mut">{label}</p><p className="mt-2 text-xl font-extrabold md:text-2xl">{value}</p></article>)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-bold">Grafik omzet</h2><p className="text-sm text-mut">Pergerakan omzet harian · puncak {rp(peak.omzet)}</p></div>
          <div className="flex rounded-xl border border-line bg-card p-1" aria-label="Rentang grafik">
            {[7, 30, 90].map((range) => <button key={range} onClick={() => setDays(range)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${days === range ? "bg-[#172923] text-white" : "text-mut hover:bg-bg"}`}>{range}H</button>)}
          </div>
        </div>
        <div className="card overflow-hidden p-3 md:p-5">
          <div className="mb-2 flex items-baseline justify-between"><span className="text-sm text-mut">Total dalam {days} hari</span><b className="text-lg">{rp(trend.reduce((sum, point) => sum + point.omzet, 0))}</b></div>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Grafik omzet ${days} hari terakhir`} className="h-64 min-w-[620px] w-full">
              <defs><linearGradient id="sales-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF5A36" stopOpacity=".28"/><stop offset="100%" stopColor="#FF5A36" stopOpacity="0"/></linearGradient></defs>
              {[0, .25, .5, .75, 1].map((fraction) => { const value = chart.ceiling * fraction; const y = chart.y(value); return <g key={fraction}><line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} stroke="currentColor" className="text-line" strokeDasharray="3 5"/><text x={chart.left - 10} y={y + 4} textAnchor="end" className="fill-current text-mut" fontSize="11">{value >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("id-ID")}jt` : value >= 1000 ? `${(value / 1000).toLocaleString("id-ID")}rb` : value}</text></g>; })}
              {chart.area && <path d={chart.area} fill="url(#sales-area)"/>}
              {chart.line && <path d={chart.line} fill="none" stroke="#FF5A36" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}
              {trend.map((point, index) => <g key={point.tanggal} className="group"><circle cx={chart.x(index)} cy={chart.y(point.omzet)} r="10" fill="transparent"><title>{new Date(`${point.tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}: {rp(point.omzet)} · {point.transaksi} transaksi</title></circle><circle cx={chart.x(index)} cy={chart.y(point.omzet)} r={days === 7 ? 4 : 2.5} fill="#FF5A36" stroke="white" strokeWidth="2" className="pointer-events-none"/></g>)}
              {trend.filter((_, index) => days === 7 || index === 0 || index === trend.length - 1 || index % Math.ceil(days / 6) === 0).map((point) => <text key={`label-${point.tanggal}`} x={chart.x(trend.indexOf(point))} y={chart.height - 10} textAnchor="middle" className="fill-current text-mut" fontSize="11">{new Date(`${point.tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</text>)}
            </svg>
          </div>
          {!trend.some((point) => point.omzet > 0) && <p className="pb-2 text-center text-sm text-mut">Belum ada penjualan pada rentang ini. Grafik akan terisi setelah transaksi dicatat.</p>}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Kondisi stok</h2><p className="text-sm text-mut">Produk sparepart, tidak termasuk jasa</p></div><Link href="/stok" className="text-sm font-semibold text-ac">Kelola stok →</Link></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <article className="card"><p className="text-sm text-mut">Total produk</p><p className="mt-2 text-2xl font-extrabold">{products.length}</p></article>
          <article className="card"><p className="text-sm text-mut">Stok menipis</p><p className="mt-2 text-2xl font-extrabold text-amber-700">{low.length}</p></article>
          <article className="card"><p className="text-sm text-mut">Stok habis</p><p className="mt-2 text-2xl font-extrabold text-red-700">{empty.length}</p></article>
        </div>
        {(low.length > 0 || empty.length > 0) && <div className="mt-3 card"><h3 className="font-bold">Perlu diperiksa</h3><ul className="mt-2 divide-y divide-line text-sm">{[...empty, ...low].slice(0, 5).map((product) => <li key={product.id} className="flex justify-between gap-3 py-2"><span>{product.nama}</span><span className={product.stok === 0 ? "font-semibold text-red-700" : "font-semibold text-amber-700"}>{product.stok === 0 ? "Habis" : `Sisa ${product.stok}`}</span></li>)}</ul></div>}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Transaksi terbaru</h2><p className="text-sm text-mut">Penjualan hari ini</p></div><Link href="/laporan" className="text-sm font-semibold text-ac">Semua laporan →</Link></div>
        <div className="card overflow-x-auto">
          {report?.sales.length ? <table className="w-full text-left text-sm"><thead className="text-mut"><tr><th className="p-2">Invoice</th><th>Waktu</th><th>Metode</th><th>Total</th></tr></thead><tbody>{report.sales.slice(0, 5).map((sale) => <tr key={sale.id} className="border-t border-line"><td className="p-2 font-medium">{sale.invoice_no}</td><td>{new Date(sale.created_at).toLocaleTimeString("id-ID")}</td><td>{sale.metode}</td><td>{rp(sale.total)}</td></tr>)}</tbody></table> : <p className="py-6 text-center text-sm text-mut">Belum ada transaksi hari ini.</p>}
        </div>
      </section>

      <section><h2 className="mb-3 text-lg font-bold">Akses cepat</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{shortcuts.map((item) => <Link href={item.href} key={item.href} className="card transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-bg text-lg font-bold text-ac">{item.icon}</span><h3 className="mt-3 font-bold">{item.title}</h3><p className="mt-1 text-sm text-mut">{item.description}</p></Link>)}</div></section>
    </div>
  );
}
