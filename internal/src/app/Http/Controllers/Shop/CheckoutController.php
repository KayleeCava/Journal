<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\User;
use App\Models\UserItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class CheckoutController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $result = DB::transaction(function () use ($userId) {
                $user = User::lockForUpdate()->find($userId);
                $cart = $user->cart;

                if (!$cart) {
                    return ['status' => 404, 'message' => 'Cart not found.'];
                }

                $pendingItems = $cart->cartItems()
                    ->where('status', 'pending')
                    ->with('item')
                    ->get();

                if ($pendingItems->isEmpty()) {
                    return ['status' => 400, 'message' => 'Your cart has no pending items to checkout.'];
                }

                $totalPrice = $pendingItems->sum(fn($cartItem) => $cartItem->item ? $cartItem->quantity * $cartItem->item->price : 0);

                if ($user->gold < $totalPrice) {
                    return [
                        'status' => 422,
                        'message' => 'You don\'t have enough gold.',
                        'data' => [
                            'current_gold'  => $user->gold,
                            'required_gold' => $totalPrice,
                        ]
                    ];
                }

                $user->decrement('gold', $totalPrice);

                foreach ($pendingItems as $cartItem) {
                    $userItem = UserItem::firstOrNew([
                        'user_id' => $user->id,
                        'item_id' => $cartItem->item_id,
                    ]);

                    $userItem->save();
                }

                $itemIdsToUpdate = $pendingItems->pluck('id');
                CartItem::whereIn('id', $itemIdsToUpdate)->update(['status' => 'paid']);

                $purchasedItems = CartItem::with('item')->whereIn('id', $itemIdsToUpdate)->get();

                return [
                    'status' => 200,
                    'message' => 'Checkout successful!',
                    'data' => [
                        'total_paid'      => $totalPrice,
                        'remaining_gold'  => $user->gold,
                        'purchased_items' => CartItemResource::collection($purchasedItems),
                    ]
                ];
            });

            $statusCode = $result['status'];
            unset($result['status']);

            return response()->json([
                'status_code' => $statusCode,
                ...$result
            ], $statusCode);

        } catch (Throwable $e) {
            return response()->json([
                'status_code' => 500,
                'message'     => 'An error occurred during the transaction.',
                'error'       => $e->getMessage()
            ], 500);
        }
    }
}
