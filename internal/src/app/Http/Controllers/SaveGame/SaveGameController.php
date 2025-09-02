<?php

namespace App\Http\Controllers\SaveGame;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveGameRequest;
use App\Models\Comment;


class SaveGameController extends Controller
{
    public function __invoke(SaveGameRequest $request, Comment $comment)
    {
        $user = $request->user();
        $validatedData = $request->validated();
        $user->update($validatedData);

        return response()->json([
            'status_code' => 200,
            'message' => 'Save game successful.',
        ], 200);
    }
}
