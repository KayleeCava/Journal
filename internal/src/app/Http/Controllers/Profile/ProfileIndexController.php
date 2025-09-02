<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProfileIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Profile/Index');
    }
}
