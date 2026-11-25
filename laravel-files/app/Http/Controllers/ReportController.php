<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function range(Request $request)
    {
        $data = $request->validate([
            'dari' => 'required|date_format:Y-m-d',
            'sampai' => 'required|date_format:Y-m-d|after_or_equal:dari',
        ]);
        $start = Carbon::parse($data['dari'])->startOfDay();
        $end = Carbon::parse($data['sampai'])->addDay()->startOfDay();
        $sales = Sale::query()
            ->select('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at')
            ->where('status', 'selesai')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<', $end)
            ->with('items:id,sale_id,nama,qty,harga,harga_beli')->latest()->get();
        $modal = $sales->sum(fn ($sale) => $sale->items->sum(fn ($item) => $item->qty * $item->harga_beli));
        $omzet = $sales->sum('total');
        $pendapatanKotor = $sales->sum('subtotal');

        return [
            'omzet' => $omzet,
            'pendapatan_kotor' => $pendapatanKotor,
            'diskon' => $sales->sum('diskon'),
            'modal' => $modal,
            'pendapatan_bersih' => $omzet,
            'transaksi' => $sales->count(),
            'item' => $sales->sum(fn ($sale) => $sale->items->sum('qty')),
            'laba' => $omzet - $modal,
            'sales' => $sales->map(fn ($sale) => array_merge($sale->only('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at'), [
                'items' => $sale->items->map(fn ($item) => $item->only('nama', 'qty', 'harga', 'harga_beli'))->values(),
            ]))->values(),
        ];
    }

    public function trend(Request $request)
    {
        $days = (int) $request->query('days', 7);
        abort_unless(in_array($days, [7, 30, 90], true), 422, 'Rentang grafik tidak valid.');

        $start = today()->subDays($days - 1)->startOfDay();
        $totals = Sale::where('status', 'selesai')->whereBetween('created_at', [$start, now()])
            ->selectRaw('DATE(created_at) as tanggal, SUM(total) as omzet, COUNT(*) as transaksi')
            ->groupByRaw('DATE(created_at)')->get()->keyBy('tanggal');

        return collect(range(0, $days - 1))->map(function ($offset) use ($start, $totals) {
            $date = $start->copy()->addDays($offset)->toDateString();
            $row = $totals->get($date);
            return ['tanggal' => $date, 'omzet' => (float) ($row->omzet ?? 0), 'transaksi' => (int) ($row->transaksi ?? 0)];
        });
    }

    public function history()
    {
        return Sale::query()
            ->select('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at')
            ->where('status', 'selesai')
            ->where('created_at', '<', today()->startOfDay())
            ->with('items:id,sale_id,nama,qty,harga,harga_beli')->latest()->get()
            ->groupBy(fn ($sale) => $sale->created_at->toDateString())
            ->map(fn ($sales, $date) => [
                'tanggal' => $date,
                'omzet' => $sales->sum('total'),
                'pendapatan_kotor' => $sales->sum('subtotal'),
                'diskon' => $sales->sum('diskon'),
                'modal' => $sales->sum(fn ($sale) => $sale->items->sum(fn ($item) => $item->qty * $item->harga_beli)),
                'pendapatan_bersih' => $sales->sum('total'),
                'transaksi' => $sales->count(),
                'item' => $sales->sum(fn ($s) => $s->items->sum('qty')),
                'laba' => $sales->sum(fn ($s) => $s->total - $s->items->sum(fn ($i) => $i->qty * $i->harga_beli)),
                'sales' => $sales->map(fn ($s) => array_merge($s->only('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at'), [
                    'items' => $s->items->map(fn ($i) => $i->only('nama', 'qty', 'harga', 'harga_beli'))->values(),
                ]))->values(),
            ])->values();
    }

    public function today()
    {
        $start = today()->startOfDay();
        $end = $start->copy()->addDay();
        $sales = Sale::query()
            ->select('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at')
            ->where('status', 'selesai')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<', $end)
            ->with('items:id,sale_id,nama,qty,harga,harga_beli')->latest()->get();

        $modal = $sales->sum(fn ($s) => $s->items->sum(fn ($i) => $i->qty * $i->harga_beli));
        $omzet = $sales->sum('total');
        $pendapatanKotor = $sales->sum('subtotal');

        return [
            'omzet' => $omzet,
            'pendapatan_kotor' => $pendapatanKotor,
            'diskon' => $sales->sum('diskon'),
            'modal' => $modal,
            'pendapatan_bersih' => $omzet,
            'transaksi' => $sales->count(),
            'item' => $sales->sum(fn ($s) => $s->items->sum('qty')),
            'laba' => $omzet - $modal,
            'sales' => $sales->map(fn ($s) => array_merge($s->only('id', 'invoice_no', 'metode', 'total', 'subtotal', 'diskon', 'dibayar', 'created_at'), [
                'items' => $s->items->map(fn ($i) => $i->only('nama', 'qty', 'harga', 'harga_beli'))->values(),
            ])),
        ];
    }
}
