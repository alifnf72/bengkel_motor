"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, DEMO_MODE } from "@/lib/api";
import type { User } from "@/lib/types";

const MENU = [
  { href: "/kasir", label: "Kasir", roles: ["admin", "kasir"] },
  { href: "/stok", label: "Stok", roles: ["admin", "kasir", "gudang"] },
  { href: "/laporan", label: "Laporan", roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) return router.replace("/login");
    api<User>("/me").then(setUser).catch(() => { localStorage.removeItem("token"); router.replace("/login"); });
  }, [router]);

  async function keluar() {
    try { await api("/logout", { method: "POST" }); } catch {}
    localStorage.removeItem("token"); router.replace("/");
  }

  if (!user) return <div className="p-8 text-mut">Memuat…</div>;
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex gap-1 border-b border-line bg-card p-3 md:w-52 md:flex-col md:border-b-0 md:border-r">
        <div className="mb-2 hidden px-2 md:block"><b>Bengkel Motor</b><p className="text-xs text-mut">{user.name} ({user.role})</p></div>
        {MENU.filter((m) => m.roles.includes(user.role)).map((m) => (
          <Link key={m.href} href={m.href} className={`rounded-xl px-3 py-3 text-sm ${path === m.href ? "bg-bg text-tx shadow-[inset_3px_0_#FF5A36]" : "text-mut"}`}>{m.label}</Link>
        ))}
        <div className="flex-1" />
        <Link href="/" className="rounded-xl px-3 py-3 text-sm text-mut">Profil bengkel</Link>
        <button onClick={keluar} className="rounded-xl px-3 py-3 text-left text-sm text-mut">Keluar</button>
      </aside>
      <main className="flex-1 p-4">{DEMO_MODE && <div className="mb-4 rounded-xl border border-ac/30 bg-ac/10 px-4 py-2 text-sm text-ac">Mode demo · data contoh hanya tersimpan sementara di sesi browser ini.</div>}{children}</main>
    </div>
  );
}
