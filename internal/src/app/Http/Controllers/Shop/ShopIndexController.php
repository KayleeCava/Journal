<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShopIndexController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Shop/Index');
    }
}
