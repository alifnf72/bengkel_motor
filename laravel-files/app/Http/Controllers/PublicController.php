<?php

namespace App\Http\Controllers;

use App\Models\Product;

class PublicController extends Controller
{
    // Katalog publik: tidak pernah menyertakan harga beli.
    public function products()
    {
        return Product::where('is_public', true)->orderBy('nama')->get()->map(fn ($p) => [
            'id' => $p->id,
            'nama' => $p->nama,
            'kategori' => $p->kategori,
            'harga_jual' => $p->harga_jual,
            'is_jasa' => $p->is_jasa,
            'tersedia' => $p->is_jasa || $p->stok > 0,
        ]);
    }
}
