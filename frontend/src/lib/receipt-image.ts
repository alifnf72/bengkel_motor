import { rp } from "@/lib/format";
import { SHOP } from "@/lib/shop";

export type ReceiptData = {
  invoice_no: string;
  created_at: string;
  subtotal: number;
  diskon: number;
  total: number;
  dibayar: number;
  metode: string;
  items: { nama: string; qty: number; harga: number }[];
};

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

export function receiptImageUrl(sale: ReceiptData) {
  const width = 384;
  const height = 260 + sale.items.length * 48;
  const date = new Date(sale.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  const lines = [
    `<text x="192" y="36" text-anchor="middle" font-size="20" font-weight="700">${escapeXml(SHOP.nama)}</text>`,
    `<text x="192" y="61" text-anchor="middle" font-size="12">${escapeXml(SHOP.telp)}</text>`,
    `<text x="20" y="94" font-size="13">${escapeXml(sale.invoice_no)}</text>`,
    `<text x="20" y="115" font-size="12">${escapeXml(date)}</text>`,
    `<path d="M20 130 H364" stroke="#222" stroke-dasharray="4 4"/>`,
  ];
  let y = 154;
  for (const item of sale.items) {
    lines.push(`<text x="20" y="${y}" font-size="13" textLength="344" lengthAdjust="spacingAndGlyphs">${escapeXml(item.nama)}</text>`);
    y += 19;
    lines.push(`<text x="20" y="${y}" font-size="12">${item.qty} x ${escapeXml(rp(item.harga))}</text><text x="364" y="${y}" text-anchor="end" font-size="12">${escapeXml(rp(item.qty * item.harga))}</text>`);
    y += 23;
  }
  lines.push(`<path d="M20 ${y} H364" stroke="#222" stroke-dasharray="4 4"/>`); y += 23;
  lines.push(`<text x="20" y="${y}" font-size="12">Subtotal</text><text x="364" y="${y}" text-anchor="end" font-size="12">${escapeXml(rp(sale.subtotal))}</text>`); y += 21;
  if (sale.diskon > 0) { lines.push(`<text x="20" y="${y}" font-size="12">Diskon</text><text x="364" y="${y}" text-anchor="end" font-size="12">-${escapeXml(rp(sale.diskon))}</text>`); y += 21; }
  lines.push(`<text x="20" y="${y}" font-size="16" font-weight="700">TOTAL</text><text x="364" y="${y}" text-anchor="end" font-size="16" font-weight="700">${escapeXml(rp(sale.total))}</text>`); y += 25;
  lines.push(`<text x="20" y="${y}" font-size="12">${escapeXml(sale.metode)} · Dibayar ${escapeXml(rp(sale.dibayar))}</text>`); y += 21;
  if (sale.metode === "Tunai") lines.push(`<text x="20" y="${y}" font-size="12">Kembalian</text><text x="364" y="${y}" text-anchor="end" font-size="12">${escapeXml(rp(sale.dibayar - sale.total))}</text>`);
  lines.push(`<text x="192" y="${height - 20}" text-anchor="middle" font-size="12">Terima kasih telah berbelanja</text>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g fill="#171717" font-family="monospace">${lines.join("")}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
