// Ganti dengan data bengkel Anda. Nantinya bisa dipindah ke tabel shop_settings (Fase 5).
export const SHOP = {
  nama: "Bengkel Motor Akay",
  tagline: "Motor sehat, perjalanan tenang.",
  alamat: "Jl. Langkaplancar - Lakbok No.122, Neglasari, Kec. Pamarican, Kabupaten Ciamis, Jawa Barat 46382",
  jam: "Senin–Sabtu 08.00–17.00, Minggu tutup",
  telp: "0821-1761-7859",
  wa: "6282117617859",
  hero_badge: "Bengkel terpercaya sejak 2012",
  hero_judul: "Motor sehat, perjalanan tenang.",
  hero_deskripsi: "Sparepart pilihan untuk motor harian, harga transparan, dan bantuan memilih komponen yang tepat untuk perjalanan Anda.",
  hero_image: "/images/hero-bengkel.png",
  logo_image: "/images/logo-akai.png",
  tentang_judul: "Onderdil yang tepat bikin perjalanan lebih tenang.",
  highlights: [
    { no: "01", title: "Pilihan onderdil", desc: "Tersedia oli, ban, rem, aki, busi, filter, rantai, dan lampu." },
    { no: "02", title: "Bantuan memilih", desc: "Kami bantu mencocokkan komponen dengan tipe dan kebutuhan motor Anda." },
    { no: "03", title: "Harga jelas", desc: "Informasi harga dan ketersediaan barang bisa ditanyakan sebelum membeli." },
  ],
  pembayaran: {
    demo: true,
    rekening: {
      BCA: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      BRI: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      BNI: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      Mandiri: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      BSI: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
    },
    eWallet: {
      DANA: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      OVO: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      GoPay: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
      ShopeePay: { nomor: "0000 0000 0000", atasNama: "TOKO AKAY (DEMO)" },
    },
    gambarQris: "/images/qris-demo.svg",
  },
  layanan: [
    { nama: "Ganti oli", desc: "Oli mesin dan gardan, selesai sambil menunggu.", harga: "mulai Rp 15.000" },
    { nama: "Servis ringan", desc: "Cek rem, rantai, busi, filter udara, dan pengaturan mesin.", harga: "mulai Rp 60.000" },
    { nama: "Servis berat", desc: "Turun mesin, ganti seher, overhaul CVT.", harga: "sesuai kerusakan" },
    { nama: "Kelistrikan", desc: "Aki, lampu, kiprok, dan kabel body.", harga: "cek gratis" },
  ],
};
