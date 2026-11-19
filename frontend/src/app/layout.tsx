import "./globals.css";
import type { Metadata } from "next";
import { MotionSetup } from "@/components/MotionSetup";

export const metadata: Metadata = {
  title: "Bengkel Motor Akay",
  description: "Servis motor dan sparepart. Kasir, stok, dan laporan penjualan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body><MotionSetup />{children}</body>
    </html>
  );
}
