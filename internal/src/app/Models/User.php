<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'bio',
        'avatar_url',
        'save_game',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function avatarUrl(){
        return 'https://www.gravatar.com/avatar/' . md5($this->email) . '.jpg';
    }

    public function mention()
    {
        return $this->hasOne(UserMention::class, 'id');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function achievement()
    {
        return $this->belongsTo(Achievement::class);
    }

    public function achieved()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('achieved_at')
            ->withTimestamps();
    }

    public function items()
    {
        return $this->hasManyThrough(
            Item::class,
            UserItem::class,

            'user_id',
            'id',

            'id',
            'item_id'
        );
    }

    public function userAchievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
