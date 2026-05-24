<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Food;
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
        $query = Order::with(['items', 'vendor']);

        if ($user->role->value === 'vendor') {
            $query->where('vendor_id', $user->id);
        } elseif ($user->role->value === 'student') {
            $query->where('customer_id', $user->id);
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
     * Store a student preorder.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role->value !== 'student') {
            return $this->error("Only students can place preorders", 403);
        }

        $validated = $request->validate([
            'pickup_slot' => ['required', 'string', 'max:60'],
            'payment_method' => ['required', 'in:cash,digital'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'exists:foods,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $order = DB::transaction(function () use ($validated, $user) {
            $foodIds = collect($validated['items'])->pluck('food_id')->all();
            $foods = Food::with('vendor')->whereIn('id', $foodIds)->lockForUpdate()->get()->keyBy('id');
            $vendorIds = $foods->pluck('vendor_id')->unique();

            if ($vendorIds->count() !== 1) {
                abort(422, "Please order from one canteen stall at a time.");
            }

            if ($foods->contains(fn ($food) => $food->vendor?->role->value !== 'vendor')) {
                abort(422, "This item is not assigned to an active vendor stall.");
            }

            $total = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $food = $foods[$item['food_id']];
                $quantity = (int) $item['quantity'];

                if (!$food->is_available || ($food->track_stock && $food->stock_qty < $quantity)) {
                    abort(422, "{$food->name} is no longer available in that quantity.");
                }

                if ($food->track_stock) {
                    $food->decrement('stock_qty', $quantity);
                }

                $total += $food->price * $quantity;
                $lineItems[] = [
                    'food_id' => $food->id,
                    'food_name' => $food->name,
                    'quantity' => $quantity,
                    'price_at_purchase' => $food->price,
                ];
            }

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'vendor_id' => $vendorIds->first(),
                'customer_id' => $user->id,
                'customer_name' => $user->name,
                'pickup_slot' => $validated['pickup_slot'],
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'New',
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->createMany($lineItems);

            return $order->load(['items', 'vendor']);
        });

        return $this->success("Preorder placed successfully", new OrderResource($order), 201);
    }

    /**
     * Display a single order for the owning student, vendor, or admin.
     */
    public function show(Request $request, string $id)
    {
        $order = Order::with(['items', 'vendor', 'customer'])->findOrFail($id);
        $user = $request->user();

        if (
            $user->role->value === 'student' && $order->customer_id !== $user->id ||
            $user->role->value === 'vendor' && $order->vendor_id !== $user->id
        ) {
            return $this->error("Unauthorized", 403);
        }

        return $this->success("Order retrieved successfully", new OrderResource($order));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);
        $user = $request->user();
        
        $validated = $request->validate([
            'status' => 'required|in:New,Preparing,Ready,Served,Cancelled',
        ]);

        if ($user->role->value === 'student') {
            if ($order->customer_id !== $user->id) {
                return $this->error("Unauthorized", 403);
            }

            if ($validated['status'] !== 'Cancelled') {
                return $this->error("Students can only cancel their own orders", 403);
            }

            if (!in_array($order->status, ['New', 'Preparing'], true)) {
                return $this->error("This order can no longer be cancelled", 422);
            }

            $order->update(['status' => 'Cancelled']);

            return $this->success("Order cancelled successfully", new OrderResource($order->load('items')));
        }

        if ($user->role->value !== 'vendor' || $user->id !== $order->vendor_id) {
            return $this->error("Unauthorized", 403);
        }

        $order->update($validated);

        return $this->success("Order status updated", new OrderResource($order->load('items')));
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

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'FH-' . now()->format('Ymd') . '-' . random_int(1000, 9999);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
