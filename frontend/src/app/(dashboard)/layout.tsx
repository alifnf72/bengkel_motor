"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, DEMO_MODE } from "@/lib/api";
import type { User } from "@/lib/types";
import { LoadingText } from "@/components/LoadingText";
import { motion, useReducedMotion } from "motion/react";

const MotionLink = motion.create(Link);

const MENU = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin"] },
  { href: "/kasir", label: "Kasir", roles: ["admin", "kasir"] },
  { href: "/stok", label: "Stok", roles: ["admin", "kasir", "gudang"] },
  { href: "/laporan", label: "Laporan", roles: ["admin"] },
  { href: "/profil-toko", label: "Profil Toko", roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!localStorage.getItem("token")) return router.replace("/login");
    api<User>("/me").then(setUser).catch(() => { localStorage.removeItem("token"); router.replace("/login"); });
  }, [router]);

  async function keluar() {
    try { await api("/logout", { method: "POST" }); } catch {}
    localStorage.removeItem("token"); router.replace("/");
  }

  if (!user) return <div className="grid min-h-[45vh] place-items-center"><LoadingText label="Memuat akun…" /></div>;
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex gap-1 border-b border-line bg-card p-3 md:w-52 md:flex-col md:border-b-0 md:border-r">
        <div className="mb-2 hidden px-2 md:block"><b>Bengkel Motor</b><p className="text-xs text-mut">{user.name} ({user.role})</p></div>
        {MENU.filter((m) => m.roles.includes(user.role)).map((m) => (
          <MotionLink key={m.href} href={m.href} whileHover={reducedMotion ? undefined : { x: 4, scale: 1.015 }} whileTap={reducedMotion ? undefined : { scale: 0.96 }} transition={{ type: "spring", stiffness: 520, damping: 28 }} className={`relative isolate rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-bg/60 hover:text-tx ${path === m.href ? "text-tx" : "text-mut"}`}>
            {path === m.href && <motion.span layoutId="dashboard-menu-active" className="absolute inset-0 -z-10 rounded-xl bg-bg shadow-[inset_3px_0_#FF5A36]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{m.label}</span>
          </MotionLink>
        ))}
        <div className="flex-1" />
        <Link href="/" className="rounded-xl px-3 py-3 text-sm text-mut">Profil bengkel</Link>
        <button onClick={keluar} className="rounded-xl px-3 py-3 text-left text-sm text-mut">Keluar</button>
      </aside>
      <main className="flex-1 p-4">{DEMO_MODE && <div className="mb-4 rounded-xl border border-ac/30 bg-ac/10 px-4 py-2 text-sm text-ac">Mode demo · data contoh hanya tersimpan sementara di sesi browser ini.</div>}{children}</main>
    </div>
  );
}
