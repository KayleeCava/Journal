<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AuthLoginRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class AuthLoginController extends Controller
{
    public function __invoke(AuthLoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            $user = User::where('email', $credentials['email'])->first();
            
            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'status_code' => 401,
                    'message' => 'Invalid login credentials.',
                ], 401);
            }

            $user->load(['achievement', 'userAchievements']);
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'status_code' => 200,
                'data' => [
                    'token' => $token,
                    'user'  => new UserProfileResource($user),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Internal server error during login.',
            ], 500);
        }
    }
}
