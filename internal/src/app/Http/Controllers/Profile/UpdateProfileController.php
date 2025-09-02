<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserProfileResource;
use Illuminate\Support\Facades\Hash;

class UpdateProfileController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param UpdateProfileRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(UpdateProfileRequest $request)
    {
        try {
            $user = $request->user();

            $validatedData = $request->validated();

            if (isset($validatedData['password'])) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            }

            $user->update($validatedData);

            return response()->json([
                'status_code' => 200,
                'message' => 'Update profile successful.',
                'data' => new UserProfileResource($user->fresh())
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while updating the profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
