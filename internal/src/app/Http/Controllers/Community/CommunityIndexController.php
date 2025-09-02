<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use Inertia\Inertia;


class CommunityIndexController extends Controller

{
    public function __invoke()
    {
        return Inertia::render('Community/Index');
    }
}
