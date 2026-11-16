"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setErr("Isi email dan kata sandi.");
    setBusy(true); setErr("");
    try {
      const r = await api<{ token: string }>("/login", { method: "POST", body: { email, password } });
      localStorage.setItem("token", r.token);
      router.push("/kasir");
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center p-5">
      <form onSubmit={masuk} className="card flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-xl font-bold">Masuk ke kasir</h1>
        <p className="text-sm text-mut">Khusus pemilik dan karyawan bengkel.</p>
        <label className="text-sm">Email<input className="input mt-1" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></label>
        <label className="text-sm">Kata sandi<input className="input mt-1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <p className="min-h-5 text-sm text-bad">{err}</p>
        <button className="btn-pri" disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</button>
        <Link href="/" className="btn flex items-center justify-center">Kembali ke profil bengkel</Link>
      </form>
    </main>
  );
}
