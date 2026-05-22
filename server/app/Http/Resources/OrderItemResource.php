<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'food_id' => $this->food_id,
            'food_name' => $this->food_name,
            'quantity' => $this->quantity,
            'price_at_purchase' => $this->price_at_purchase,
            'subtotal' => $this->quantity * $this->price_at_purchase,
        ];
    }
}
