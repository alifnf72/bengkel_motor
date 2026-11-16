<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    // Harga, stok, dan total SELALU dihitung ulang di sini; angka dari browser tidak dipercaya.
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.qty' => 'required|integer|min:1|max:10000',
            'diskon' => 'nullable|integer|min:0',
            'metode' => 'required|in:Tunai,Transfer,QRIS',
            'dibayar' => 'nullable|integer|min:0',
        ]);

        // Gabungkan baris dengan produk yang sama.
        $qtys = [];
        foreach ($data['items'] as $i) {
            $qtys[$i['id']] = ($qtys[$i['id']] ?? 0) + $i['qty'];
        }

        return DB::transaction(function () use ($data, $qtys, $request) {
            $sale = Sale::create(['kasir_id' => $request->user()->id, 'metode' => $data['metode']]);
            $subtotal = 0;

            foreach ($qtys as $id => $qty) {
                $p = Product::lockForUpdate()->findOrFail($id);
                if (! $p->is_jasa && $p->stok < $qty) {
                    throw ValidationException::withMessages(['items' => "Stok {$p->nama} tidak cukup (sisa {$p->stok})."]);
                }
                SaleItem::create([
                    'sale_id' => $sale->id, 'product_id' => $p->id, 'nama' => $p->nama,
                    'qty' => $qty, 'harga' => $p->harga_jual, 'harga_beli' => $p->harga_beli,
                ]);
                if (! $p->is_jasa) {
                    $p->decrement('stok', $qty);
                    StockMovement::create(['product_id' => $p->id, 'perubahan' => -$qty, 'alasan' => 'Penjualan', 'user_id' => $request->user()->id]);
                }
                $subtotal += $p->harga_jual * $qty;
            }

            $diskon = min($data['diskon'] ?? 0, $subtotal);
            $total = $subtotal - $diskon;
            $dibayar = $data['metode'] === 'Tunai' ? ($data['dibayar'] ?? 0) : $total;
            if ($dibayar < $total) {
                throw ValidationException::withMessages(['dibayar' => 'Uang diterima kurang.']);
            }

            $invoice = 'INV-' . now()->format('ymd') . '-' . str_pad((string) $sale->id, 5, '0', STR_PAD_LEFT);
            $sale->update(['subtotal' => $subtotal, 'diskon' => $diskon, 'total' => $total, 'dibayar' => $dibayar, 'invoice_no' => $invoice]);

            return response()->json(['id' => $sale->id, 'invoice_no' => $invoice, 'total' => $total, 'dibayar' => $dibayar], 201);
        });
    }
}
