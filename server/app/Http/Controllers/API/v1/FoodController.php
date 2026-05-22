<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Http\Resources\FoodResource;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class FoodController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Food::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        // Filtering by vendor if provided
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filtering by availability status
        if ($request->has('filter_status')) {
            switch ($request->filter_status) {
                case 'available':
                    $query->where('is_available', true)->where('stock_qty', '>', 0);
                    break;
                case 'low_stock':
                    $query->where('track_stock', true)->where('stock_qty', '<=', 5)->where('stock_qty', '>', 0);
                    break;
                case 'out_of_stock':
                    $query->where(function($q) {
                        $q->where('is_available', false)->orWhere('stock_qty', 0);
                    });
                    break;
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        
        $allowedSortFields = ['name', 'category', 'price', 'stock_qty', 'created_at'];
        if (!in_array($sortBy, $allowedSortFields)) $sortBy = 'name';
        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) $sortOrder = 'asc';

        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = (int) $request->input('limit', 10);
        $paginated = $query->paginate($perPage);

        return $this->success(
            "Menu items retrieved successfully",
            [
                'data' => FoodResource::collection($paginated->items()),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ]
            ],
            200
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'track_stock' => 'required|boolean',
            'stock_qty' => 'required|integer|min:0',
            'is_available' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('food', 'public');
            $validated['image'] = $path;
        }

        $food = Food::create($validated);

        return $this->success("Menu item created successfully", new FoodResource($food), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $food = Food::findOrFail($id);
        return $this->success("Menu item retrieved", new FoodResource($food), 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $food = Food::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'track_stock' => 'sometimes|required|boolean',
            'stock_qty' => 'sometimes|required|integer|min:0',
            'is_available' => 'sometimes|required|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('food', 'public');
            $validated['image'] = $path;
        }

        $food->update($validated);

        return $this->success("Menu item updated", new FoodResource($food), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $food = Food::findOrFail($id);
        $food->delete();
        return $this->success("Menu item deleted", null, 200);
    }
}
