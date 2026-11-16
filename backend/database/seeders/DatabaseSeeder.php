<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Ganti kata sandi ini sebelum dipakai sungguhan!
        User::create(['name' => 'Pemilik', 'email' => 'admin@bengkel.test', 'password' => 'password', 'role' => 'admin']);
        User::create(['name' => 'Kasir', 'email' => 'kasir@bengkel.test', 'password' => 'password', 'role' => 'kasir']);
        User::create(['name' => 'Gudang', 'email' => 'gudang@bengkel.test', 'password' => 'password', 'role' => 'gudang']);

        // [sku, barcode, nama, kategori, harga_jual, harga_beli, stok, stok_min, is_jasa]
        $rows = [
            ['OLI-001', '899000100001', 'Oli Mesin 0.8L MPX2', 'Oli', 48000, 38000, 24, 5, false],
            ['OLI-002', '899000100002', 'Oli Gardan 120ml', 'Oli', 12000, 8500, 30, 8, false],
            ['BAN-001', '899000200001', 'Ban Luar 80/90-14', 'Ban', 235000, 195000, 6, 4, false],
            ['BAN-002', '899000200002', 'Ban Dalam 250/275-17', 'Ban', 32000, 24000, 12, 5, false],
            ['KRM-001', '899000300001', 'Kampas Rem Depan Beat', 'Rem', 35000, 26000, 3, 5, false],
            ['KRM-002', '899000300002', 'Kampas Rem Belakang Vario', 'Rem', 38000, 28000, 10, 5, false],
            ['AKI-001', '899000400001', 'Aki GS Astra 3.5Ah', 'Aki', 165000, 135000, 5, 3, false],
            ['BSI-001', '899000500001', 'Busi NGK CPR8EA', 'Busi', 28000, 20000, 40, 10, false],
            ['FLT-001', '899000600001', 'Filter Udara Mio', 'Filter', 42000, 31000, 8, 4, false],
            ['RNT-001', '899000700001', 'Rantai Set 428H', 'Rantai', 145000, 115000, 0, 3, false],
            ['LMP-001', '899000800001', 'Bohlam H4 35/35W', 'Lampu', 22000, 15000, 15, 5, false],
            ['SRV-001', null, 'Jasa Ganti Oli', 'Jasa', 15000, 0, 0, 0, true],
            ['SRV-002', null, 'Jasa Servis Ringan', 'Jasa', 60000, 0, 0, 0, true],
        ];
        foreach ($rows as [$sku, $bc, $nama, $kat, $jual, $beli, $stok, $min, $jasa]) {
            Product::create([
                'sku' => $sku, 'barcode' => $bc, 'nama' => $nama, 'kategori' => $kat,
                'harga_jual' => $jual, 'harga_beli' => $beli, 'stok' => $stok, 'stok_min' => $min, 'is_jasa' => $jasa,
            ]);
        }
    }
}
