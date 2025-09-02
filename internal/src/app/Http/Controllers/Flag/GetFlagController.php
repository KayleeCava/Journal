<?php

namespace App\Http\Controllers\Flag;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GetFlagController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $flag = env('FLAG2');

            if (!$flag) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Flag is not configured on the server.'
                ], 404);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Flag retrieved successfully.',
                'data' => [
                    'flag' => $flag
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while retrieving flag.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
