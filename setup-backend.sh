#!/usr/bin/env bash
# Membuat folder backend/ (Laravel) lalu menyalin kode bengkel ke dalamnya.
# Jalankan dari folder ini:  bash setup-backend.sh   (Windows: pakai Git Bash)
set -e
command -v composer >/dev/null || { echo "Composer belum terpasang. Lihat README langkah 1."; exit 1; }
[ -d backend ] && { echo "Folder backend sudah ada. Hapus dulu jika ingin membuat ulang."; exit 1; }

composer create-project laravel/laravel backend
cd backend
php artisan install:api --no-interaction        # memasang Laravel Sanctum + routes/api.php
cp -R ../laravel-files/. .                       # menimpa dengan kode bengkel

# Arahkan ke MySQL & zona waktu WIB
sed -i 's/^#\? *DB_CONNECTION=.*/DB_CONNECTION=mysql/; s/^#\? *DB_HOST=.*/DB_HOST=127.0.0.1/; s/^#\? *DB_PORT=.*/DB_PORT=3306/; s/^#\? *DB_DATABASE=.*/DB_DATABASE=bengkel_motor/; s/^#\? *DB_USERNAME=.*/DB_USERNAME=root/; s/^#\? *DB_PASSWORD=.*/DB_PASSWORD=/' .env
sed -i "s#'timezone' => .*#'timezone' => 'Asia/Jakarta',#" config/app.php

echo
echo "Selesai. Langkah berikutnya:"
echo "1. Buat database MySQL bernama bengkel_motor (lewat phpMyAdmin / HeidiSQL)."
echo "2. Jika user/password MySQL Anda bukan root & kosong, ubah di backend/.env"
echo "3. cd backend && php artisan migrate --seed && php artisan serve"
