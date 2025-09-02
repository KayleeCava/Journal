<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cart_item_id' => $this->id,
            'quantity'     => $this->quantity,
            'status'       => $this->status,
            'item'         => new ItemResource($this->whenLoaded('item')),
        ];
    }
}
