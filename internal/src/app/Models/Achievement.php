<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'required_score',
        'icon',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
