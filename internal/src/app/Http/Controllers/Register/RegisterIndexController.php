<?php

namespace App\Http\Controllers\Register;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RegisterIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Register/Index');
    }
}
