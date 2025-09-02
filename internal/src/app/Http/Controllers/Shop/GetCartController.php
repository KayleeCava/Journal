<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use Illuminate\Http\Request;

class GetCartController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request)
    {
        try {
            $user = $request->user();

            $cart = $user->cart()->first();

            if (!$cart) {
                return response()->json([
                    'status_code' => 200,
                    'message'     => 'Empty cart, go to shopping for adding items into cart.',
                    'data'        => []
                ], 200);
            }

            $pendingCartItems = $cart->cartItems()
                ->where('status', 'pending')
                ->with('item')
                ->get();

            $totalPrice = $pendingCartItems->sum(function ($cartItem) {
                if ($cartItem->item) {
                    return $cartItem->quantity * $cartItem->item->price;
                }
                return 0;
            });

            $formattedItems = CartItemResource::collection($pendingCartItems);

            return response()->json([
                'status_code' => 200,
                'message'     => 'Cart retrieved successfully.',
                'data'        => [
                    'total_price' => $totalPrice,
                    'items'       => $formattedItems,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message'     => 'An error occurred while retrieving the cart.',
                'error'       => $e->getMessage()
            ], 500);
        }
    }
}
