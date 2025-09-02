<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\RemoveItemsFromCartRequest;
use App\Models\CartItem;

class RemoveItemsFromCartController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param RemoveItemsFromCartRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(RemoveItemsFromCartRequest $request)
    {
        try {
            $user = $request->user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json([
                    'status_code' => 404,
                    'message'     => 'Cart not found for this user.',
                ], 404);
            }

            $cartItemIdsToDelete = $request->validated()['cart_item_ids'];

            $itemsDeletedCount = CartItem::where('cart_id', $cart->id)
                ->whereIn('id', $cartItemIdsToDelete)
                ->delete();

            if ($itemsDeletedCount === 0) {
                return response()->json([
                    'status_code' => 404,
                    'message'     => 'No matching items found in your cart to delete.',
                ], 404);
            }

            return response()->json([
                'status_code' => 200,
                'message'     => 'Successfully removed ' . $itemsDeletedCount . ' item(s) from the cart',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message'     => 'An error occurred while removing items from the cart.',
                'error'       => $e->getMessage(),
            ], 500);
        }
    }
}
