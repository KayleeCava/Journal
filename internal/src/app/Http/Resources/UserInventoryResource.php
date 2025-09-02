<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserInventoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->item->id,
            'name'        => $this->item->name,
            'description' => $this->item->description,
            'image'       => $this->item->image,
            'price'       => $this->item->price,
            'item_id'     => $this->id,
            'purchased_at' => $this->created_at,
        ];
    }
}
