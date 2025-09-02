<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'item_id'     => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'image'       => $this->image,
            'quantity_owned' => $this->whenPivotLoaded('user_items', function () {
                return $this->pivot->quantity;
            }),
        ];
    }
}
