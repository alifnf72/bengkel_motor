# Bengkel Motor: Kasir, Stok, Katalog, Laporan

- **Backend:** Laravel 11/12 (REST API) + MySQL + Laravel Sanctum (login token)
- **Frontend:** Next.js 14 (React) + TypeScript + Tailwind CSS
- Teks antarmuka berbahasa Indonesia.

```
bengkel-motor-laravel/
├── frontend/              ← Next.js + Tailwind (siap dipakai)
├── laravel-files/         ← kode bengkel untuk Laravel (migrasi, model, controller, route, seeder)
├── setup-backend.sh       ← membuat folder backend/ dari Laravel baru + laravel-files
└── README.md
```
Folder `backend/` baru muncul setelah Anda menjalankan `setup-backend.sh` (Laravel dipasang lewat Composer, bukan ikut di ZIP).

## Yang sudah ada
- Profil bengkel publik (`/`) + katalog sparepart (tanpa harga beli)
- Login (`/login`) dengan peran **admin**, **kasir**, **gudang**
- Kasir (`/kasir`): scan barcode, cari, keranjang, diskon, Tunai/Transfer/QRIS, kembalian, struk 58mm (F2 = scan, F4 = bayar)
- Stok (`/stok`): daftar, status menipis/habis, tambah produk, barang masuk
- Laporan (`/laporan`, admin): omzet, transaksi, item terjual, laba kotor hari ini
- Keamanan: harga & stok dihitung ulang di Laravel saat transaksi (dalam DB transaction + lock); harga beli hanya dikirim ke admin; hak akses dicek di server.

Belum ada: stok opname, cetak label barcode, kelola pengguna, pengaturan, grafik, ekspor Excel/PDF, batalkan transaksi, scan kamera.

## Persiapan (sekali saja)
1. Pasang **PHP 8.2+**, **Composer**, **MySQL** (paling mudah: XAMPP atau Laragon di Windows), **Node.js 18+**, dan **VS Code**.

## Menjalankan backend
```bash
bash setup-backend.sh          # membuat folder backend/
# buat database MySQL kosong bernama: bengkel_motor
cd backend
php artisan migrate --seed
php artisan serve              # API di http://localhost:8000
```
Akun contoh (kata sandi: `password`): `admin@bengkel.test`, `kasir@bengkel.test`, `gudang@bengkel.test`. **Ganti sebelum dipakai sungguhan.**

## Menjalankan frontend
```bash
cd frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev                    # buka http://localhost:3000
```

## Endpoint API
| Method | URL | Akses |
|---|---|---|
| POST | /api/login | publik |
| GET | /api/public/products | publik |
| GET | /api/me, POST /api/logout | login |
| GET | /api/products | login (harga beli hanya admin) |
| POST/PUT | /api/products, /api/products/{id} | admin, gudang |
| POST | /api/products/{id}/stock | admin, gudang |
| POST | /api/sales | admin, kasir |
| GET | /api/reports/today | admin |

## Deploy

### Frontend ke Vercel
1. Impor repository GitHub `alifnf72/bengkel_motor` ke Vercel.
2. Atur **Root Directory** ke `frontend` (framework akan terdeteksi sebagai Next.js).
3. Untuk demo showcase tanpa backend, tambahkan Environment Variable `NEXT_PUBLIC_DEMO_MODE=true`. Mode ini memakai data contoh dan semua perubahan hanya sementara di sesi browser.
4. Deploy. Setiap perubahan baru ke branch `main` akan memicu deployment berikutnya.

### Backend Laravel
Untuk aplikasi operasional, backend harus di-host terpisah pada hosting PHP/VPS dengan MySQL. Atur `NEXT_PUBLIC_DEMO_MODE=false` dan `NEXT_PUBLIC_API_URL` ke URL Laravel publik yang berakhiran `/api`. Atur `.env` backend produksi (`APP_ENV=production`, `APP_DEBUG=false`, kredensial database), jalankan `php artisan migrate --force`, dan izinkan domain frontend Vercel di konfigurasi CORS Laravel. Mode demo tidak memerlukan backend.
