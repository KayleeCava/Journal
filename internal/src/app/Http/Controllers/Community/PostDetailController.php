<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PostDetailController extends Controller
{
    public function __invoke(string $slug)
    {
        return Inertia::render('Community/PostDetail', [
            'slug' => $slug,
        ]);
    }
}
