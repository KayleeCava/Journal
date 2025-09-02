<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthLogoutController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        try {
            $user = $request->user('sanctum');

            if (!$user) {
                return response()->json([
                    'status_code' => 401,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $token = $user->currentAccessToken();

            if ($token) {
                $token->delete();
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Logged out successfully.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Internal server error during logout.'
            ], 500);
        }
    }
}
