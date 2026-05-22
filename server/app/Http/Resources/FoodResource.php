<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FoodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'name' => $this->name,
            'category' => $this->category,
            'price' => $this->price,
            'track_stock' => $this->track_stock,
            'stock_qty' => $this->stock_qty,
            'is_available' => $this->is_available,
            'image' => $this->image,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'vendor' => new UserResource($this->whenLoaded('vendor')),
        ];
    }
}
