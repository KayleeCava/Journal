<?php

namespace App\Http\Controllers\Ranking;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RankingIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Ranking/Index');
    }
}
