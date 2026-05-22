<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'order_number' => $this->order_number,
            'vendor_id' => $this->vendor_id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'pickup_slot' => $this->pickup_slot,
            'total_amount' => $this->total_amount,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'vendor' => new UserResource($this->whenLoaded('vendor')),
            'customer' => new UserResource($this->whenLoaded('customer')),
        ];
    }
}
