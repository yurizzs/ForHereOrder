<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with('items');

        // Vendors only see their own orders
        if ($user->role->value === 'vendor') {
            $query->where('vendor_id', $user->id);
        }

        // Filtering
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($request->limit ?? 10);

        return $this->success(
            "Orders retrieved successfully",
            [
                'data' => OrderResource::collection($orders->items()),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ]
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);
        
        // Authorization: only vendor of this order can update it
        if ($request->user()->id !== $order->vendor_id) {
            return $this->error("Unauthorized", 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:New,Preparing,Ready,Served,Cancelled',
        ]);

        $order->update($validated);

        return $this->success("Order status updated", new OrderResource($order));
    }

    /**
     * Get End-of-Day Canteen Settlement Report.
     */
    public function settlement(Request $request)
    {
        $user = $request->user();
        if ($user->role->value !== 'vendor') {
            return $this->error("Only vendors can access settlement reports", 403);
        }

        $date = $request->input('date', Carbon::today()->toDateString());
        
        $stats = Order::where('vendor_id', $user->id)
            ->whereDate('created_at', $date)
            ->where('status', '!=', 'Cancelled')
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->groupBy('payment_method')
            ->get();

        $breakdown = [
            'cash' => ['count' => 0, 'amount' => 0],
            'digital' => ['count' => 0, 'amount' => 0],
            'total' => ['count' => 0, 'amount' => 0]
        ];

        foreach ($stats as $stat) {
            $breakdown[$stat->payment_method] = [
                'count' => (int) $stat->total_orders,
                'amount' => (float) $stat->total_revenue
            ];
            $breakdown['total']['count'] += (int) $stat->total_orders;
            $breakdown['total']['amount'] += (float) $stat->total_revenue;
        }

        return $this->success(
            "Settlement report for {$date}",
            [
                'date' => $date,
                'breakdown' => $breakdown
            ]
        );
    }
}
