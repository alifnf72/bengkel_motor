"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rp } from "@/lib/format";
import { receiptImageUrl, type ReceiptData } from "@/lib/receipt-image";
import { SHOP } from "@/lib/shop";

type Sale = Omit<ReceiptData, "items"> & { id: number; items: (ReceiptData["items"][number] & { harga_beli?: number })[] };
type Report = { omzet: number; pendapatan_kotor?: number; diskon?: number; modal?: number; pendapatan_bersih?: number; transaksi: number; item: number; laba: number; sales: Sale[] };
type DayReport = Report & { tanggal: string };
type ItemSummary = { nama: string; qty: number; kotor: number; diskon: number; bersih: number; modal: number; laba: number };

const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const xmlEscape = (value: unknown) => String(value ?? "").replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
type ExcelCell = { value: string | number; style?: string; mergeAcross?: number };
const excelCell = ({ value, style, mergeAcross }: ExcelCell) => `<ss:Cell${style ? ` ss:StyleID="${style}"` : ""}${mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : ""}><ss:Data ss:Type="${typeof value === "number" ? "Number" : "String"}" xml:space="preserve">${xmlEscape(value)}</ss:Data></ss:Cell>`;
const excelRow = (cells: ExcelCell[], height?: number) => `<ss:Row${height ? ` ss:Height="${height}"` : ""}>${cells.map(excelCell).join("")}</ss:Row>`;
const excelSheet = (name: string, widths: number[], rows: string) => `<ss:Worksheet ss:Name="${name}"><ss:Table>${widths.map((width) => `<ss:Column ss:Width="${width}"/>`).join("")}${rows}</ss:Table></ss:Worksheet>`;
function summarizeItems(sales: Sale[]): ItemSummary[] {
  const items = new Map<string, ItemSummary>();
  sales.forEach((sale) => {
    const saleGross = sale.subtotal || sale.items.reduce((sum, item) => sum + item.qty * item.harga, 0);
    let discountAllocated = 0;
    sale.items.forEach((item, index) => {
      const gross = item.qty * item.harga;
      const discount = index === sale.items.length - 1 ? sale.diskon - discountAllocated : saleGross ? Math.floor(sale.diskon * gross / saleGross) : 0;
      discountAllocated += discount;
      const bersih = gross - discount;
      const modal = item.qty * (item.harga_beli ?? 0);
      const summary = items.get(item.nama) ?? { nama: item.nama, qty: 0, kotor: 0, diskon: 0, bersih: 0, modal: 0, laba: 0 };
      summary.qty += item.qty; summary.kotor += gross; summary.diskon += discount;
      summary.bersih += bersih; summary.modal += modal; summary.laba += bersih - modal;
      items.set(item.nama, summary);
    });
  });
  return [...items.values()].sort((a, b) => b.qty - a.qty || a.nama.localeCompare(b.nama, "id"));
}
const excelStyles = `<ss:Styles>
  <ss:Style ss:ID="Default" ss:Name="Normal"><ss:Alignment ss:Vertical="Center"/><ss:Font ss:FontName="Aptos" ss:Size="10" ss:Color="#202536"/></ss:Style>
  <ss:Style ss:ID="Title"><ss:Alignment ss:Vertical="Center"/><ss:Font ss:FontName="Aptos Display" ss:Size="18" ss:Bold="1" ss:Color="#FFFFFF"/><ss:Interior ss:Color="#151A2C" ss:Pattern="Solid"/></ss:Style>
  <ss:Style ss:ID="Subtitle"><ss:Alignment ss:Vertical="Center"/><ss:Font ss:FontName="Aptos" ss:Size="11" ss:Bold="1" ss:Color="#C94429"/><ss:Interior ss:Color="#FFF0EC" ss:Pattern="Solid"/></ss:Style>
  <ss:Style ss:ID="Section"><ss:Alignment ss:Vertical="Center"/><ss:Font ss:FontName="Aptos" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><ss:Interior ss:Color="#252B40" ss:Pattern="Solid"/></ss:Style>
  <ss:Style ss:ID="Label"><ss:Alignment ss:Vertical="Center"/><ss:Font ss:Bold="1"/><ss:Interior ss:Color="#F1F3F7" ss:Pattern="Solid"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E0E3EA"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="Value"><ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/><ss:Font ss:Bold="1" ss:Size="11"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E0E3EA"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="Currency"><ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/><ss:NumberFormat ss:Format="&quot;Rp&quot; #,##0"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E0E3EA"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="Profit"><ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/><ss:Font ss:Bold="1" ss:Color="#167044"/><ss:NumberFormat ss:Format="&quot;Rp&quot; #,##0"/><ss:Interior ss:Color="#E9F7EF" ss:Pattern="Solid"/></ss:Style>
  <ss:Style ss:ID="TableHeader"><ss:Alignment ss:Vertical="Center" ss:WrapText="1"/><ss:Font ss:Bold="1" ss:Color="#FFFFFF"/><ss:Interior ss:Color="#252B40" ss:Pattern="Solid"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#FF5A36"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="Body"><ss:Alignment ss:Vertical="Center"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E5E7EB"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="BodyAlt"><ss:Alignment ss:Vertical="Center"/><ss:Interior ss:Color="#F5F6F9" ss:Pattern="Solid"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E5E7EB"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="BodyCurrency"><ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/><ss:NumberFormat ss:Format="&quot;Rp&quot; #,##0"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E5E7EB"/></ss:Borders></ss:Style>
  <ss:Style ss:ID="BodyCurrencyAlt"><ss:Alignment ss:Horizontal="Right" ss:Vertical="Center"/><ss:NumberFormat ss:Format="&quot;Rp&quot; #,##0"/><ss:Interior ss:Color="#F5F6F9" ss:Pattern="Solid"/><ss:Borders><ss:Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#E5E7EB"/></ss:Borders></ss:Style>
</ss:Styles>`;

export default function Laporan() {
  const [r, setR] = useState<Report | null>(null);
  const [history, setHistory] = useState<DayReport[]>([]);
  const [msg, setMsg] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rangeReport, setRangeReport] = useState<Report | null>(null);
  const [rangeBusy, setRangeBusy] = useState(false);

  useEffect(() => {
    const today = localDate();
    setFrom(today); setTo(today);
    Promise.all([api<DayReport[]>("/reports/history"), api<Report>(`/reports/range?dari=${today}&sampai=${today}`)])
      .then(([previous, selected]) => { setR(selected); setHistory(previous); setRangeReport(selected); })
      .catch((e) => setMsg(e.message));
  }, []);

  async function loadRange() {
    if (!from || !to || from > to) { setMsg("Tanggal awal harus sebelum atau sama dengan tanggal akhir."); return; }
    setMsg(""); setRangeBusy(true);
    try { setRangeReport(await api<Report>(`/reports/range?dari=${from}&sampai=${to}`)); }
    catch (e) { setMsg((e as Error).message); }
    finally { setRangeBusy(false); }
  }

  function downloadExcel() {
    if (!rangeReport) return;
    const items = summarizeItems(rangeReport.sales);
    const gross = rangeReport.pendapatan_kotor ?? rangeReport.sales.reduce((sum, sale) => sum + sale.subtotal, 0);
    const discount = rangeReport.diskon ?? rangeReport.sales.reduce((sum, sale) => sum + sale.diskon, 0);
    const net = rangeReport.pendapatan_bersih ?? rangeReport.omzet;
    const modal = rangeReport.modal ?? Math.max(0, net - rangeReport.laba);
    const summaryRows = [
      excelRow([{ value: "LAPORAN PENJUALAN", style: "Title", mergeAcross: 1 }], 38),
      excelRow([{ value: `Periode: ${from} s.d. ${to}`, style: "Subtitle", mergeAcross: 1 }], 26),
      excelRow([]),
      excelRow([{ value: "RINGKASAN", style: "Section", mergeAcross: 1 }], 25),
      excelRow([{ value: "Pendapatan kotor (sebelum diskon)", style: "Label" }, { value: gross, style: "Currency" }], 24),
      excelRow([{ value: "Diskon", style: "Label" }, { value: discount, style: "Currency" }], 24),
      excelRow([{ value: "Pendapatan bersih (setelah diskon)", style: "Label" }, { value: net, style: "Currency" }], 24),
      excelRow([{ value: "Jumlah transaksi", style: "Label" }, { value: rangeReport.transaksi, style: "Value" }], 24),
      excelRow([{ value: "Item terjual", style: "Label" }, { value: rangeReport.item, style: "Value" }], 24),
      excelRow([{ value: "Modal barang", style: "Label" }, { value: modal, style: "Currency" }], 24),
      excelRow([{ value: "Laba setelah modal", style: "Label" }, { value: net - modal, style: "Profit" }], 26),
      excelRow([]),
      excelRow([{ value: `Dibuat: ${new Date().toLocaleString("id-ID")}`, style: "Subtitle", mergeAcross: 1 }], 22),
    ].join("");

    const transactionRows = [
      excelRow([{ value: "RINCIAN PEMBAYARAN", style: "Title", mergeAcross: 9 }], 38),
      excelRow([{ value: `Periode: ${from} s.d. ${to}`, style: "Subtitle", mergeAcross: 9 }], 26),
      excelRow([]),
      excelRow(["No. transaksi", "Waktu", "Metode", "Pendapatan kotor", "Diskon", "Pendapatan bersih", "Dibayar", "Kembalian", "Status kembalian", "Rincian barang"].map((value) => ({ value, style: "TableHeader" })), 34),
    ];
    rangeReport.sales.forEach((sale, index) => {
      const alt = index % 2 === 1;
      const body = alt ? "BodyAlt" : "Body";
      const currency = alt ? "BodyCurrencyAlt" : "BodyCurrency";
      const change = sale.metode.toLowerCase() === "tunai" ? Math.max(0, sale.dibayar - sale.total) : 0;
      transactionRows.push(excelRow([
        { value: sale.invoice_no, style: body },
        { value: new Date(sale.created_at).toLocaleString("id-ID"), style: body },
        { value: sale.metode, style: body },
        { value: sale.subtotal, style: currency },
        { value: sale.diskon, style: currency },
        { value: sale.total, style: currency },
        { value: sale.dibayar, style: currency },
        { value: change, style: currency },
        { value: sale.metode.toLowerCase() !== "tunai" ? "Tidak berlaku" : change > 0 ? "Ada kembalian" : "Pas / tidak ada" , style: body },
        { value: sale.items.map((item) => `${item.nama} (${item.qty} x ${rp(item.harga)})`).join("; "), style: body },
      ], 24));
    });
    transactionRows.push(excelRow([{ value: "TOTAL PERIODE", style: "Section", mergeAcross: 2 },
      { value: gross, style: "Currency" }, { value: discount, style: "Currency" }, { value: net, style: "Profit" },
      { value: rangeReport.sales.reduce((sum, sale) => sum + sale.dibayar, 0), style: "Currency" },
      { value: rangeReport.sales.reduce((sum, sale) => sum + (sale.metode.toLowerCase() === "tunai" ? Math.max(0, sale.dibayar - sale.total) : 0), 0), style: "Currency" },
      { value: "", style: "Section" }, { value: "", style: "Section" },
    ], 27));

    const detailRows = [
      excelRow([{ value: "RINCIAN BARANG TERJUAL", style: "Title", mergeAcross: 10 }], 38),
      excelRow([{ value: `Periode: ${from} s.d. ${to}`, style: "Subtitle", mergeAcross: 10 }], 26),
      excelRow([]),
      excelRow(["No. transaksi", "Waktu", "Metode", "Nama barang", "Jumlah", "Harga satuan", "Kotor", "Alokasi diskon", "Bersih", "Modal", "Laba barang"].map((value) => ({ value, style: "TableHeader" })), 34),
    ];
    rangeReport.sales.forEach((sale, saleIndex) => {
      const saleGross = sale.subtotal || sale.items.reduce((sum, item) => sum + item.qty * item.harga, 0);
      let allocated = 0;
      sale.items.forEach((item, itemIndex) => {
        const itemGross = item.qty * item.harga;
        const itemDiscount = itemIndex === sale.items.length - 1 ? sale.diskon - allocated : saleGross ? Math.floor(sale.diskon * itemGross / saleGross) : 0;
        allocated += itemDiscount;
        const itemNet = itemGross - itemDiscount;
        const itemModal = item.qty * (item.harga_beli ?? 0);
        const alt = saleIndex % 2 === 1;
        const body = alt ? "BodyAlt" : "Body";
        const currency = alt ? "BodyCurrencyAlt" : "BodyCurrency";
        detailRows.push(excelRow([
          { value: sale.invoice_no, style: body }, { value: new Date(sale.created_at).toLocaleString("id-ID"), style: body },
          { value: sale.metode, style: body }, { value: item.nama, style: body }, { value: item.qty, style: body },
          { value: item.harga, style: currency }, { value: itemGross, style: currency }, { value: itemDiscount, style: currency },
          { value: itemNet, style: currency }, { value: itemModal, style: currency }, { value: itemNet - itemModal, style: currency },
        ], 24));
      });
    });

    const productRows = [
      excelRow([{ value: "RINGKASAN PRODUK TERJUAL", style: "Title", mergeAcross: 6 }], 38),
      excelRow([{ value: `Periode: ${from} s.d. ${to}`, style: "Subtitle", mergeAcross: 6 }], 26),
      excelRow([]),
      excelRow(["Nama barang", "Jumlah terjual", "Kotor", "Diskon", "Bersih", "Modal", "Laba barang"].map((value) => ({ value, style: "TableHeader" })), 32),
    ];
    items.forEach((item, index) => {
      const style = index % 2 ? "BodyAlt" : "Body";
      const currency = index % 2 ? "BodyCurrencyAlt" : "BodyCurrency";
      productRows.push(excelRow([
        { value: item.nama, style }, { value: item.qty, style }, { value: item.kotor, style: currency },
        { value: item.diskon, style: currency }, { value: item.bersih, style: currency },
        { value: item.modal, style: currency }, { value: item.laba, style: currency },
      ], 24));
    });

    const workbook = `<?xml version="1.0" encoding="UTF-8"?><ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${excelStyles}${excelSheet("Ringkasan", [250, 190], summaryRows)}${excelSheet("Pembayaran", [130, 150, 90, 125, 95, 130, 110, 110, 145, 360], transactionRows.join(""))}${excelSheet("Rincian Item", [130, 150, 90, 190, 80, 110, 115, 125, 115, 115, 115], detailRows.join(""))}${excelSheet("Produk Terjual", [210, 100, 120, 110, 120, 120, 120], productRows.join(""))}</ss:Workbook>`;
    const url = URL.createObjectURL(new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `laporan-${from}-${to}.xls`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const sales = r?.sales ?? [];
  const reportSales = rangeReport?.sales ?? [];
  const soldProducts = summarizeItems(reportSales);
  const grossRevenue = rangeReport?.pendapatan_kotor ?? reportSales.reduce((sum, sale) => sum + sale.subtotal, 0);
  const totalDiscount = rangeReport?.diskon ?? reportSales.reduce((sum, sale) => sum + sale.diskon, 0);
  const netRevenue = rangeReport?.pendapatan_bersih ?? rangeReport?.omzet ?? 0;
  const inventoryCost = rangeReport?.modal ?? Math.max(0, netRevenue - (rangeReport?.laba ?? 0));
  return (
    <div>
      <style jsx global>{`@page { size: A4 landscape; margin: 9mm; } @media print { html, body { width: 100%; height: auto; margin: 0 !important; padding: 0 !important; background: #fff !important; color: #111 !important; font-size: 9pt; } body * { visibility: hidden !important; } #print-report, #print-report * { visibility: visible !important; } #print-report { position: absolute; inset: 0 auto auto 0; width: 100%; margin: 0 !important; padding: 0 !important; color: #111; background: #fff; } #print-report h2 { margin: 0 0 7px !important; font-size: 16pt; } #print-report h3 { margin: 8px 0 5px !important; font-size: 11pt; } #print-report .card { margin: 0 0 7px !important; padding: 7px !important; color: #111; background: #fff; border: 1px solid #d5d9e1; border-radius: 5px; box-shadow: none; } #print-report .grid { gap: 5px !important; } #print-report .text-mut { color: #4b5563 !important; } #print-report table { width: 100%; border-collapse: collapse; font-size: 8pt; } #print-report th, #print-report td { padding: 3px 5px !important; border-bottom: 1px solid #dfe3e8; vertical-align: top; } #print-report thead { display: table-header-group; } #print-report th { color: #fff !important; background: #252b40 !important; font-weight: 700; print-color-adjust: exact; -webkit-print-color-adjust: exact; } #print-report .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 6px !important; } #print-report article { break-inside: auto; page-break-inside: auto; } #print-report article > div:first-child { padding-bottom: 4px !important; } #print-report img { width: 105px !important; max-height: 170px; object-fit: contain; } #print-report .rounded-full { color: #111 !important; background: #f1f3f7 !important; border: 1px solid #cbd0da; } #print-report .text-xl { font-size: 11pt !important; } #print-report .text-lg { font-size: 12pt !important; } #print-report .text-sm { font-size: 8pt !important; } #print-report .text-2xl { font-size: 12pt !important; } #print-report .mb-5, #print-report .mb-6 { margin-bottom: 7px !important; } #print-report .pt-3 { padding-top: 5px !important; } #print-report .no-print { display: none !important; } .no-print { display: none !important; } }`}</style>
      {msg && <p className="mb-3 text-sm text-bad">{msg}</p>}
      <section className="card no-print mb-5">
        <h2 className="text-lg font-bold">Ekspor laporan berdasarkan tanggal</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm text-mut">Dari tanggal<input className="input mt-1" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setRangeReport(null); }} /></label>
          <label className="text-sm text-mut">Sampai tanggal<input className="input mt-1" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setRangeReport(null); }} /></label>
          <button className="btn" onClick={loadRange} disabled={rangeBusy}>{rangeBusy ? "Memuat…" : "Tampilkan"}</button>
          <button className="btn" onClick={downloadExcel} disabled={!rangeReport}>Unduh Excel (.xls)</button>
          <button className="btn-pri" onClick={() => window.print()} disabled={!rangeReport}>Cetak / Simpan PDF</button>
        </div>
      </section>
      <section id="print-report" className="mb-6">
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-ac pb-2">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-ac">{SHOP.nama}</p><h2 className="mb-0 text-lg font-extrabold">Laporan Penjualan</h2></div>
          <p className="text-sm font-semibold text-mut">Periode: {from} s.d. {to}</p>
        </header>
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Pendapatan kotor", rp(grossRevenue)], ["Diskon", rp(totalDiscount)],
            ["Pendapatan bersih", rp(netRevenue)], ["Modal barang", rp(inventoryCost)],
            ["Laba kotor setelah modal", rp(netRevenue - inventoryCost)], ["Transaksi", rangeReport?.transaksi ?? 0],
            ["Item terjual", rangeReport?.item ?? 0], ["Jenis produk", soldProducts.length],
          ].map(([label, value]) => <div key={label as string} className="card"><span className="text-sm text-mut">{label}</span><p className="text-xl font-extrabold">{value}</p></div>)}
        </div>
        <div className="card mb-5 overflow-x-auto">
          <h3 className="font-bold">Rincian barang terjual</h3>
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-mut"><tr><th className="p-2">Barang</th><th>Jumlah</th><th>Kotor</th><th>Diskon</th><th>Bersih</th><th>Modal</th><th>Laba</th></tr></thead>
            <tbody>{soldProducts.map((item) => <tr key={item.nama} className="border-t border-line"><td className="p-2 font-medium">{item.nama}</td><td>{item.qty}</td><td>{rp(item.kotor)}</td><td>{rp(item.diskon)}</td><td>{rp(item.bersih)}</td><td>{rp(item.modal)}</td><td>{rp(item.laba)}</td></tr>)}</tbody>
          </table>
          {rangeReport && !soldProducts.length && <p className="py-6 text-center text-mut">Belum ada barang terjual pada rentang tanggal ini.</p>}
        </div>
        <h3 className="mb-3 text-lg font-bold">Detail transaksi dan bukti pembayaran</h3>
        <div className="space-y-4">
          {reportSales.map((sale) => {
            const isCash = sale.metode.toLowerCase() === "tunai";
            const change = isCash ? Math.max(0, sale.dibayar - sale.total) : 0;
            const receiptUrl = receiptImageUrl(sale);
            return <article key={sale.id} className="card break-inside-avoid">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
                <div><h4 className="font-bold">{sale.invoice_no}</h4><p className="text-sm text-mut">{new Date(sale.created_at).toLocaleString("id-ID")}</p></div>
                <span className="rounded-full bg-[#252B40] px-3 py-1 text-sm font-semibold text-white">{sale.metode}</span>
              </div>
              <div className="grid gap-4 pt-3 md:grid-cols-[1fr_auto]">
                <div>
                  <table className="w-full text-sm"><thead className="text-left text-mut"><tr><th className="py-1">Nama barang</th><th>Qty</th><th>Harga satuan</th><th className="text-right">Jumlah</th></tr></thead>
                    <tbody>{sale.items.map((item, index) => <tr key={`${sale.id}-${index}`} className="border-t border-line"><td className="py-2">{item.nama}</td><td>{item.qty}</td><td>{rp(item.harga)}</td><td className="text-right">{rp(item.harga * item.qty)}</td></tr>)}</tbody>
                  </table>
                  <div className="ml-auto mt-3 grid max-w-sm grid-cols-2 gap-y-1 text-sm"><span className="text-mut">Pendapatan kotor</span><b className="text-right">{rp(sale.subtotal)}</b><span className="text-mut">Diskon</span><b className="text-right">− {rp(sale.diskon)}</b><span className="font-bold">Pendapatan bersih</span><b className="text-right text-ac">{rp(sale.total)}</b><span className="text-mut">Uang diterima</span><b className="text-right">{rp(sale.dibayar)}</b>{isCash && <><span className="text-mut">Kembalian</span><b className="text-right">{change > 0 ? rp(change) : "Tidak ada (uang pas)"}</b></>}</div>
                </div>
                <div className="flex flex-col items-center gap-2"><img src={receiptUrl} alt={`Struk pembayaran ${sale.invoice_no}`} className="w-44 border border-line bg-white shadow-sm" /><button className="no-print text-sm font-semibold text-ac" onClick={() => setSelectedReceipt(sale)}>Perbesar struk</button></div>
              </div>
            </article>;
          })}
          {rangeReport && !rangeReport.sales.length && <div className="card py-8 text-center text-mut">Tidak ada transaksi pada rentang tanggal ini.</div>}
        </div>
      </section>
      <h2 className="mb-3 text-lg font-bold">Ringkasan hari ini</h2>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Omzet hari ini", rp(r?.omzet ?? 0)], ["Transaksi", r?.transaksi ?? 0], ["Item terjual", r?.item ?? 0], ["Laba kotor", rp(r?.laba ?? 0)]].map(([t, v]) => (
          <div key={t as string} className="card"><span className="text-sm text-mut">{t}</span><p className="text-2xl font-extrabold">{v}</p></div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <b>Transaksi hari ini</b>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-mut"><tr><th className="p-2">No</th><th>Waktu</th><th>Metode</th><th>Total</th><th>Struk</th></tr></thead>
          <tbody>{sales.map((s) => (
            <tr key={s.id} className="border-t border-line"><td className="p-2">{s.invoice_no}</td><td>{new Date(s.created_at).toLocaleTimeString("id-ID")}</td><td>{s.metode}</td><td>{rp(s.total)}</td><td><button className="font-semibold text-ac" onClick={() => setSelectedReceipt(s)}>Lihat struk</button></td></tr>
          ))}</tbody>
        </table>
        {!sales.length && <p className="py-8 text-center text-mut">Belum ada transaksi hari ini. Selesaikan penjualan pertama di halaman Kasir.</p>}
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Riwayat sebelumnya</h2>
        {!history.length && <div className="card py-6 text-center text-mut">Belum ada transaksi pada hari sebelumnya.</div>}
        <div className="space-y-4">
          {history.map((day) => (
            <div className="card overflow-x-auto" key={day.tanggal}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b>{new Date(`${day.tanggal}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b>
                <span className="text-sm text-mut">{day.transaksi} transaksi · {day.item} item · Omzet {rp(day.omzet)} · Laba {rp(day.laba)}</span>
              </div>
              <table className="mt-2 w-full text-sm">
                <thead className="text-left text-mut"><tr><th className="p-2">No</th><th>Waktu</th><th>Metode</th><th>Total</th><th>Struk</th></tr></thead>
                <tbody>{day.sales.map((s) => <tr key={s.id} className="border-t border-line"><td className="p-2">{s.invoice_no}</td><td>{new Date(s.created_at).toLocaleTimeString("id-ID")}</td><td>{s.metode}</td><td>{rp(s.total)}</td><td><button className="font-semibold text-ac" onClick={() => setSelectedReceipt(s)}>Lihat struk</button></td></tr>)}</tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
      {selectedReceipt && <div className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedReceipt(null); }}><section role="dialog" aria-modal="true" aria-labelledby="receipt-title" className="my-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl"><div className="mb-3 flex items-center justify-between"><h2 id="receipt-title" className="font-bold text-black">Struk {selectedReceipt.invoice_no}</h2><button className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100" onClick={() => setSelectedReceipt(null)} aria-label="Tutup struk">✕</button></div><img src={receiptImageUrl(selectedReceipt)} alt={`Struk transaksi ${selectedReceipt.invoice_no}`} className="mx-auto max-h-[65vh] w-auto max-w-full border border-gray-200 shadow-sm" /><div className="mt-3 flex gap-2"><a className="btn flex-1" href={receiptImageUrl(selectedReceipt)} download={`struk-${selectedReceipt.invoice_no}.svg`}>Unduh gambar struk</a><button className="btn-pri flex-1" onClick={() => setSelectedReceipt(null)}>Selesai</button></div></section></div>}
    </div>
  );
}
