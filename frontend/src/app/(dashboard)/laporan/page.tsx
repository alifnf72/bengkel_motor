"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";

type Report = { omzet: number; transaksi: number; item: number; laba: number; sales: { id: number; invoice_no: string; metode: string; total: number; created_at: string }[] };

export default function Laporan() {
  const [r, setR] = useState<Report | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { api<Report>("/reports/today").then(setR).catch((e) => setMsg(e.message)); }, []);

  const sales = r?.sales ?? [];
  return (
    <div>
      {msg && <p className="mb-3 text-sm text-bad">{msg}</p>}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Omzet hari ini", rp(r?.omzet ?? 0)], ["Transaksi", r?.transaksi ?? 0], ["Item terjual", r?.item ?? 0], ["Laba kotor", rp(r?.laba ?? 0)]].map(([t, v]) => (
          <div key={t as string} className="card"><span className="text-sm text-mut">{t}</span><p className="text-2xl font-extrabold">{v}</p></div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <b>Transaksi hari ini</b>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-mut"><tr><th className="p-2">No</th><th>Waktu</th><th>Metode</th><th>Total</th></tr></thead>
          <tbody>{sales.map((s) => (
            <tr key={s.id} className="border-t border-line"><td className="p-2">{s.invoice_no}</td><td>{new Date(s.created_at).toLocaleTimeString("id-ID")}</td><td>{s.metode}</td><td>{rp(s.total)}</td></tr>
          ))}</tbody>
        </table>
        {!sales.length && <p className="py-8 text-center text-mut">Belum ada transaksi hari ini. Selesaikan penjualan pertama di halaman Kasir.</p>}
      </div>
    </div>
  );
}
