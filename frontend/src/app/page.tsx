import Link from "next/link";
import { SHOP } from "@/lib/shop";
import { rp } from "@/lib/format";
import { productImage } from "@/lib/product-image";
import { Reveal } from "@/components/Reveal";
import { HeroImage } from "@/components/HeroImage";
import { DEMO_PRODUCTS } from "@/lib/demo";
import { DEMO_MODE } from "@/lib/api";

export const dynamic = "force-dynamic";

type Pub = { id: number; nama: string; kategori: string; harga_jual: number; is_jasa: boolean; tersedia: boolean };

async function getProducts(): Promise<Pub[]> {
  if (DEMO_MODE) return DEMO_PRODUCTS.slice(0, 8).map((p) => ({ id: p.id, nama: p.nama, kategori: p.kategori, harga_jual: p.harga_jual, is_jasa: p.is_jasa, tersedia: p.stok > 0 }));
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/public/products`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    return ((await res.json()) as Pub[]).filter((p) => !p.is_jasa).slice(0, 8);
  } catch { return []; }
}

const highlights = [
  { no: "01", title: "Pilihan onderdil", desc: "Tersedia oli, ban, rem, aki, busi, filter, rantai, dan lampu." },
  { no: "02", title: "Bantuan memilih", desc: "Kami bantu mencocokkan komponen dengan tipe dan kebutuhan motor Anda." },
  { no: "03", title: "Harga jelas", desc: "Informasi harga dan ketersediaan barang bisa ditanyakan sebelum membeli." },
];

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="min-h-screen overflow-hidden bg-bg text-tx">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#beranda" className="flex items-center gap-3">
          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-card"><img src="/images/logo-akai.png" alt="Logo Akai Ban" className="h-full w-full object-cover object-center" /></span>
          <span><b className="block leading-tight">{SHOP.nama}</b><small className="text-mut">Bengkel &amp; sparepart</small></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-mut md:flex">
          <a href="#tentang">Tentang</a><a href="#katalog">Sparepart</a><a href="#kontak">Lokasi</a>
          <Link href="/login" className="rounded-xl bg-ac px-5 py-3 font-semibold text-white">Masuk kasir</Link>
        </nav>
        <Link href="/login" className="rounded-xl bg-ac px-4 py-2.5 text-sm font-semibold text-white md:hidden">Masuk</Link>
      </header>

      <section id="beranda" className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-8 md:grid-cols-[1fr_1.02fr] md:px-8 md:pb-24 md:pt-12">
        <Reveal className="relative z-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-mut"><span className="h-2 w-2 rounded-full bg-ac" /> Bengkel terpercaya sejak 2012</p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.05em] md:text-7xl">Motor sehat,<br /><span className="text-ac">perjalanan</span> tenang.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-mut md:text-lg">Sparepart pilihan untuk motor harian, harga transparan, dan bantuan memilih komponen yang tepat untuk perjalanan Anda.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-xl bg-ac px-6 py-4 font-bold text-white shadow-lg shadow-black/20" href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noopener noreferrer">Konsultasi via WhatsApp</a>
            <a className="rounded-xl border border-line bg-card px-6 py-4 font-bold" href="#katalog">Lihat sparepart</a>
          </div>
          <div className="mt-10 flex items-center gap-4 text-sm text-mut"><div className="flex -space-x-2"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg bg-[#d9b79c]">M</span><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg bg-[#bed2c6]">S</span><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg bg-[#e8c66a]">B</span></div><span><b className="text-tx">Siap melayani</b><br />Senin-Sabtu, 08.00-17.00</span></div>
        </Reveal>
        <Reveal delay={140} className="relative mx-auto w-full max-w-[650px]">
          <div className="absolute -right-8 -top-6 h-40 w-40 rounded-full bg-line md:h-56 md:w-56" />
          <div className="absolute -bottom-7 -left-4 h-40 w-40 rounded-full bg-card md:h-52 md:w-52" />
          <div className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-black/30"><HeroImage />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-line bg-bg/90 p-4 text-white backdrop-blur md:bottom-6 md:left-6 md:right-6 md:p-5"><div><small className="text-mut">TOKO AKAY BAN</small><p className="mt-1 font-bold">Ban dan onderdil pilihan.</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-ac text-xl">↗</span></div>
          </div>
        </Reveal>
      </section>

      <section id="tentang" className="border-y border-line bg-card py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[.8fr_1.2fr] md:px-8">
          <Reveal><div><p className="text-xs font-bold uppercase tracking-[.2em] text-ac">Kenali toko kami</p><h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">Onderdil yang tepat bikin perjalanan lebih tenang.</h2></div></Reveal>
          <div className="grid gap-3 sm:grid-cols-3">{highlights.map((x, index) => <Reveal key={x.no} delay={index * 100}><article className="h-full rounded-2xl border border-line bg-bg p-5"><span className="text-sm font-bold text-ac">{x.no}</span><h3 className="mt-8 font-bold">{x.title}</h3><p className="mt-2 text-sm leading-6 text-mut">{x.desc}</p></article></Reveal>)}</div>
        </div>
      </section>

      <section id="katalog" className="border-y border-line bg-card py-16 md:py-20"><div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-ac">Pilihan untuk motor Anda</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Sparepart tersedia</h2></div><a href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noopener noreferrer" className="font-bold text-ac">Tanya ketersediaan</a></div></Reveal>
        {products.length === 0 ? <Reveal><div className="rounded-2xl border border-dashed border-line bg-bg p-9 text-center"><div className="text-3xl">+</div><p className="mt-3 font-bold">Katalog sedang diperbarui</p><p className="mt-1 text-sm text-mut">Hubungi kami untuk menanyakan stok sparepart.</p></div></Reveal> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((p, index) => <Reveal key={p.id} delay={(index % 4) * 90}><article className="h-full overflow-hidden rounded-2xl border border-line bg-bg"><img src={productImage(p.kategori)} alt={`Gambar contoh kategori ${p.kategori}`} className="h-36 w-full object-cover" /><div className="p-4"><span className="text-xs font-semibold text-mut">{p.kategori}</span><h3 className="mt-1 font-bold">{p.nama}</h3><div className="mt-4 flex items-center justify-between"><b className="text-ac">{rp(p.harga_jual)}</b><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.tersedia ? "bg-[#173b30] text-ok" : "bg-[#3d242b] text-bad"}`}>{p.tersedia ? "Tersedia" : "Habis"}</span></div></div></article></Reveal>)}</div>}
      </div></section>

      <section id="kontak" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20"><div className="grid gap-8 rounded-3xl border border-line bg-card p-7 md:grid-cols-[1fr_1.1fr] md:p-10"><Reveal><div><p className="text-xs font-bold uppercase tracking-[.2em] text-ac">Mampir atau hubungi kami</p><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Kami siap bantu perjalanan Anda.</h2><a className="mt-6 inline-flex rounded-xl bg-ac px-5 py-3 font-bold text-white" href={`https://wa.me/${SHOP.wa}`} target="_blank" rel="noopener noreferrer">Chat WhatsApp</a></div></Reveal><div className="grid gap-3 sm:grid-cols-2"><Reveal><div className="h-full rounded-2xl border border-line bg-bg p-5"><span className="text-ac">Alamat</span><p className="mt-2 text-sm leading-6 text-mut">{SHOP.alamat}</p></div></Reveal><Reveal delay={100}><div className="h-full rounded-2xl border border-line bg-bg p-5"><span className="text-ac">Jam operasional</span><p className="mt-2 text-sm leading-6 text-mut">{SHOP.jam}</p></div></Reveal><Reveal delay={200} className="sm:col-span-2"><div className="h-full rounded-2xl border border-line bg-bg p-5"><span className="text-ac">Telepon / WhatsApp</span><p className="mt-2 text-sm text-mut">{SHOP.telp}</p></div></Reveal></div></div></section>
      <footer className="border-t border-line px-5 py-6 text-center text-sm text-mut">© 2026 {SHOP.nama} · Toko onderdil motor</footer>
    </main>
  );
}
