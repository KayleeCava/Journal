<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\BasePaginationRequest;
use App\Http\Resources\UserInventoryResource;
use App\Models\UserItem;
use Illuminate\Http\Request;

class GetInventoryController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param BasePaginationRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(BasePaginationRequest $request)
    {
        try {
            $perPage = $request->validated()['per_page'] ?? 5;

            $user = $request->user();

            $ownedItems = UserItem::where('user_id', $user->id)
                ->with('item')
                ->orderByDesc('created_at')
                ->paginate($perPage);

            return UserInventoryResource::collection($ownedItems)->additional([
                'status_code' => 200,
                'message'     => 'User items retrieved successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message'     => 'An error occurred while retrieving inventory.',
                'error'       => $e->getMessage(),
            ], 500);
        }
    }
}
