<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $isAdmin = $request->user()->role === 'admin';

        // Harga beli hanya dikirim ke admin.
        return Product::orderBy('nama')->get()->map(fn ($p) => $isAdmin ? $p : $p->makeHidden('harga_beli'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:150',
            'sku' => 'required|string|max:50|unique:products,sku',
            'barcode' => 'nullable|string|max:50|unique:products,barcode',
            'kategori' => 'nullable|string|max:50',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'harga_beli' => 'nullable|integer|min:0',
            'harga_jual' => 'required|integer|min:0',
            'stok' => 'nullable|integer|min:0',
            'stok_min' => 'nullable|integer|min:0',
            'is_jasa' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
        ]);
        $image = $data['gambar'] ?? null;
        unset($data['gambar']);
        $data = array_filter($data, fn ($v) => $v !== null && $v !== '');
        if ($image) {
            $data['gambar_path'] = $image->store('products', 'local');
        }

        try {
            $product = DB::transaction(function () use ($data, $request) {
                $p = Product::create($data);
                if (($data['stok'] ?? 0) > 0) {
                    StockMovement::create(['product_id' => $p->id, 'perubahan' => $data['stok'], 'alasan' => 'Stok awal', 'user_id' => $request->user()->id]);
                }

                return $p;
            });
        } catch (\Throwable $e) {
            if (!empty($data['gambar_path'])) {
                Storage::disk('local')->delete($data['gambar_path']);
            }
            throw $e;
        }

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'nama' => 'sometimes|string|max:150',
            'sku' => ['sometimes', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'barcode' => ['nullable', 'string', 'max:50', Rule::unique('products', 'barcode')->ignore($product->id)],
            'kategori' => 'sometimes|string|max:50',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'harga_beli' => 'sometimes|integer|min:0',
            'harga_jual' => 'sometimes|integer|min:0',
            'stok_min' => 'sometimes|integer|min:0',
            'is_public' => 'sometimes|boolean',
        ]);
        $image = $data['gambar'] ?? null;
        unset($data['gambar']);
        $oldImage = $product->gambar_path;
        if ($image) {
            $data['gambar_path'] = $image->store('products', 'local');
        }
        $product->update($data);
        if ($image && $oldImage) {
            Storage::disk('local')->delete($oldImage);
        }

        return $product;
    }

    public function image(Product $product)
    {
        abort_unless($product->gambar_path && Storage::disk('local')->exists($product->gambar_path), 404);

        return Storage::disk('local')->response($product->gambar_path);
    }

    // Barang masuk (qty positif) atau koreksi (qty negatif).
    public function addStock(Request $request, Product $product)
    {
        $data = $request->validate(['qty' => 'required|integer|not_in:0', 'alasan' => 'nullable|string|max:100']);

        return DB::transaction(function () use ($data, $request, $product) {
            $p = Product::lockForUpdate()->findOrFail($product->id);
            if ($p->stok + $data['qty'] < 0) {
                throw ValidationException::withMessages(['qty' => 'Stok tidak boleh kurang dari 0.']);
            }
            $p->increment('stok', $data['qty']);
            StockMovement::create([
                'product_id' => $p->id, 'perubahan' => $data['qty'],
                'alasan' => $data['alasan'] ?? 'Barang masuk', 'user_id' => $request->user()->id,
            ]);

            return $p->fresh();
        });
    }
}
