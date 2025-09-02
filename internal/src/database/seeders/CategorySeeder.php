<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('categories')->upsert([
            ['name' => 'Rau củ', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Thực phẩm', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Đồ uống', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dụng cụ', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kho báu', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Trang sức', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tài liệu', 'created_at' => $now, 'updated_at' => $now],
        ], ['name'], ['updated_at']);
    }
}
