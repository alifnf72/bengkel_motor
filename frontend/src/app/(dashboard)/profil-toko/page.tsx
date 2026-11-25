"use client";

import { useEffect, useState } from "react";
import { api, DEMO_MODE } from "@/lib/api";
import { SHOP } from "@/lib/shop";
import type { ShopProfile } from "@/lib/types";
import { LoadingText } from "@/components/LoadingText";

export default function ProfilToko() {
  const [profile, setProfile] = useState<ShopProfile>({ ...SHOP, highlights: SHOP.highlights.map((item) => ({ ...item })) });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeHero, setRemoveHero] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    api<ShopProfile>("/shop-settings")
      .then((data) => setProfile({ ...data, highlights: data.highlights.map((item) => ({ ...item })) }))
      .catch((error) => setMessage({ text: (error as Error).message, error: true }))
      .finally(() => setLoading(false));
  }, []);

  function change(field: keyof Omit<ShopProfile, "highlights">, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function changeHighlight(index: number, field: "title" | "desc", value: string) {
    setProfile((current) => ({
      ...current,
      highlights: current.highlights.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  useEffect(() => {
    if (!heroFile) { setHeroPreview(null); return; }
    const url = URL.createObjectURL(heroFile); setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroFile]);
  useEffect(() => {
    if (!logoFile) { setLogoPreview(null); return; }
    const url = URL.createObjectURL(logoFile); setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  function asDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage(null);
    try {
      let body: unknown;
      let method = "PUT";
      if (DEMO_MODE) {
        body = {
          ...profile,
          hero_image: removeHero ? SHOP.hero_image : heroFile ? await asDataUrl(heroFile) : profile.hero_image,
          logo_image: removeLogo ? SHOP.logo_image : logoFile ? await asDataUrl(logoFile) : profile.logo_image,
        };
      } else {
        const form = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
          if (key === "hero_image" || key === "logo_image" || key === "highlights") return;
          form.set(key, String(value ?? ""));
        });
        profile.highlights.forEach((item, index) => {
          form.set(`highlights[${index}][no]`, item.no);
          form.set(`highlights[${index}][title]`, item.title);
          form.set(`highlights[${index}][desc]`, item.desc);
        });
        if (heroFile) form.set("hero_upload", heroFile);
        if (logoFile) form.set("logo_upload", logoFile);
        if (removeHero) form.set("remove_hero_image", "1");
        if (removeLogo) form.set("remove_logo_image", "1");
        form.set("_method", "PUT"); method = "POST"; body = form;
      }
      const updated = await api<ShopProfile>("/shop-settings", { method, body });
      setProfile({ ...updated, highlights: updated.highlights.map((item) => ({ ...item })) });
      setHeroFile(null); setLogoFile(null); setRemoveHero(false); setRemoveLogo(false);
      setMessage({ text: "Profil toko berhasil disimpan dan sudah tampil di halaman company profile." });
    } catch (error) {
      setMessage({ text: (error as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof Omit<ShopProfile, "highlights">, label: string, wide = false, multiline = false, optional = false) => (
    <label className={`block text-sm text-mut ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {multiline
        ? <textarea className="input mt-1 min-h-24 py-3" value={profile[key] ?? ""} onChange={(event) => change(key, event.target.value)} required={!optional} />
        : <input className="input mt-1" value={profile[key] ?? ""} onChange={(event) => change(key, event.target.value)} required={!optional} />}
    </label>
  );

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><LoadingText label="Memuat profil toko…" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header><p className="text-xs font-bold uppercase tracking-[.18em] text-ac">Pengaturan website</p><h1 className="mt-1 text-3xl font-extrabold">Profil Toko</h1><p className="mt-2 text-sm text-mut">Ubah informasi yang tampil di halaman company profile.</p></header>
      {message && <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${message.error ? "border-bad/30 bg-bad/10 text-bad" : "border-ok/30 bg-ok/10 text-ok"}`}>{message.text}</div>}
      <form onSubmit={save} className="space-y-5">
        <section className="card"><h2 className="font-bold">Informasi toko</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("nama", "Nama toko")}{field("tagline", "Tagline")}{field("telp", "Nomor telepon")}{field("wa", "Nomor WhatsApp (format internasional, tanpa +)")}{field("alamat", "Alamat", true)}{field("jam", "Jam operasional", true)}
        </div></section>
        <section className="card"><h2 className="font-bold">Konten utama company profile</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("hero_badge", "Label kecil di hero", true)}{field("hero_judul", "Judul utama", true)}{field("hero_deskripsi", "Deskripsi utama", true, true)}{field("tentang_judul", "Judul bagian tentang toko", true)}
          <div className="sm:col-span-2 grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-mut">Foto hero toko <input className="input mt-2 cursor-pointer" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setHeroFile(event.target.files?.[0] ?? null); setRemoveHero(false); }} /><span className="mt-1 block text-xs">Pilih JPG, PNG, atau WebP (maksimal 5 MB).</span>{(heroPreview || (!removeHero && profile.hero_image)) && <img className="mt-3 h-36 w-full rounded-xl border border-line object-cover" src={heroPreview || profile.hero_image || ""} alt="Pratinjau foto hero" />}<button type="button" className="mt-2 text-xs font-semibold text-ac" onClick={() => { setHeroFile(null); setRemoveHero(true); }}>Gunakan foto bawaan</button></label>
            <label className="block text-sm text-mut">Logo toko <input className="input mt-2 cursor-pointer" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setLogoFile(event.target.files?.[0] ?? null); setRemoveLogo(false); }} /><span className="mt-1 block text-xs">Pilih JPG, PNG, atau WebP (maksimal 3 MB).</span>{(logoPreview || (!removeLogo && profile.logo_image)) && <img className="mt-3 h-36 w-full rounded-xl border border-line bg-white p-3 object-contain" src={logoPreview || profile.logo_image || ""} alt="Pratinjau logo toko" />}<button type="button" className="mt-2 text-xs font-semibold text-ac" onClick={() => { setLogoFile(null); setRemoveLogo(true); }}>Gunakan logo bawaan</button></label>
          </div>
        </div></section>
        <section className="card"><h2 className="font-bold">Keunggulan toko</h2><div className="mt-4 grid gap-4 lg:grid-cols-3">
          {profile.highlights.map((item, index) => <fieldset key={item.no} className="rounded-xl border border-line p-3"><legend className="px-1 text-sm font-semibold">Keunggulan {index + 1}</legend><label className="block text-sm text-mut">Judul<input className="input mt-1" value={item.title} onChange={(event) => changeHighlight(index, "title", event.target.value)} required /></label><label className="mt-3 block text-sm text-mut">Deskripsi<textarea className="input mt-1 min-h-24 py-3" value={item.desc} onChange={(event) => changeHighlight(index, "desc", event.target.value)} required /></label></fieldset>)}
        </div></section>
        <div className="flex justify-end"><button className="btn-pri min-w-40" disabled={busy}>{busy ? <LoadingText label="Menyimpan…" light /> : "Simpan Profil Toko"}</button></div>
      </form>
    </div>
  );
}
