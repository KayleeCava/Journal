<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param RegisterRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(RegisterRequest $request)
    {
        try {
            $validatedData = $request->validated();

            $user = User::create([
                'name' => $validatedData['name'],
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
            ]);

            $user->refresh();
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'status_code' => 201,
                'message' => 'User registered successfully.',
                'data' => [
                    'token' => $token,
                    'user' => new UserResource($user),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Internal server error during registration',
            ], 500);
        }
    }
}
