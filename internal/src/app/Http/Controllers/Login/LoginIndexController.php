<?php

namespace App\Http\Controllers\Login;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LoginIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Login/Index');
    }
}
