<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Support\Facades\DB;

class AddToCartController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param AddToCartRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(AddToCartRequest $request)
    {
        try {
            $user = $request->user();
            $requestedItemIds = collect($request->validated()['item_ids'])->unique();

            $cart = $user->cart()->firstOrCreate();

            $allItemsInCart = $cart->cartItems()
                ->whereIn('item_id', $requestedItemIds->all())
                ->get();


            $purchasedItems = $allItemsInCart->where('status', 'paid');
            if ($purchasedItems->isNotEmpty()) {
                $itemNames = Item::whereIn('id', $purchasedItems->pluck('item_id'))
                    ->pluck('name')
                    ->join(', ');

                return response()->json([
                    'status_code' => 409,
                    'message' => 'Action failed. You have already purchased the following item(s) and cannot add them again: ' . $itemNames . '.',
                ], 409);
            }

            $pendingItemIds = $allItemsInCart->where('status', 'pending')->pluck('item_id');

            $newItemIds = $requestedItemIds->diff($pendingItemIds)->values();

            if ($newItemIds->isEmpty()) {
                return response()->json([
                    'status_code' => 409,
                    'message' => 'Item already in your cart.',
                ], 409);
            }

            DB::transaction(function () use ($cart, $newItemIds) {
                foreach ($newItemIds as $itemId) {
                    $cart->items()->attach($itemId, [
                        'status' => 'pending',
                        'quantity' => 1
                    ]);
                }
            });

            $addedItems = Item::whereIn('id', $newItemIds)->get();

            return response()->json([
                'status_code' => 201,
                'message' => 'Items added to cart successfully.',
                'data' => ItemResource::collection($addedItems)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while adding items to cart.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
