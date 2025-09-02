<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $achievements = [
            [
                'name' => 'Unranked', 'required_score' => 0, 'icon' => 'icons/unranked.png', 'answer_key' => null,
            ],
            [
                'name' => 'Bronze', 'required_score' => 1, 'icon' => 'icons/bronze.png', 'answer_key' => env('ANSWER_KEY_1'),
            ],
            [
                'name' => 'Silver', 'required_score' => 2, 'icon' => 'icons/silver.png', 'answer_key' => env('ANSWER_KEY_2'),
            ],
            [
                'name' => 'Gold', 'required_score' => 3, 'icon' => 'icons/gold.png', 'answer_key' => env('ANSWER_KEY_3'),
            ],
            [
                'name' => 'Diamond', 'required_score' => 4, 'icon' => 'icons/diamond.png', 'answer_key' => env('ANSWER_KEY_4'),
            ],
            [
                'name' => 'Crystal', 'required_score' => 5, 'icon' => 'icons/crystal.png', 'answer_key' => env('ANSWER_KEY_5'),
            ],
        ];

        $dataToInsert = array_map(function ($achievement) use ($now) {
            if (!is_null($achievement['answer_key'])) {
                $achievement['answer_key'] = Hash::make($achievement['answer_key']);
            }
            // Thêm timestamps
            $achievement['created_at'] = $now;
            $achievement['updated_at'] = $now;
            return $achievement;
        }, $achievements);


        DB::table('achievements')->upsert($dataToInsert, ['name'], ['required_score', 'icon', 'answer_key', 'updated_at']);
    }
}
