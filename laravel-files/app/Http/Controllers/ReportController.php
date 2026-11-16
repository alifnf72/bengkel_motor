<?php

namespace App\Http\Controllers;

use App\Models\Sale;

class ReportController extends Controller
{
    public function today()
    {
        $sales = Sale::where('status', 'selesai')->whereDate('created_at', today())
            ->with('items:id,sale_id,qty,harga_beli')->latest()->get();

        $modal = $sales->sum(fn ($s) => $s->items->sum(fn ($i) => $i->qty * $i->harga_beli));
        $omzet = $sales->sum('total');

        return [
            'omzet' => $omzet,
            'transaksi' => $sales->count(),
            'item' => $sales->sum(fn ($s) => $s->items->sum('qty')),
            'laba' => $omzet - $modal,
            'sales' => $sales->map(fn ($s) => $s->only('id', 'invoice_no', 'metode', 'total', 'created_at')),
        ];
    }
}
