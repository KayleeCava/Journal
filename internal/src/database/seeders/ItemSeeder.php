<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('items')->truncate();

        $categoryIds = DB::table('categories')->pluck('id', 'name');

        $requiredCategories = [
            'Rau củ', 'Thực phẩm', 'Đồ uống',
            'Dụng cụ', 'Kho báu', 'Trang sức', 'Tài liệu'
        ];

        foreach ($requiredCategories as $category) {
            if (!isset($categoryIds[$category])) {
                $this->command->error("Category '{$category}' không tồn tại. Vui lòng chạy CategorySeeder trước.");
                return;
            }
        }

        $items = [
            ['name' => 'Chìa khóa', 'description' => 'Một chiếc chìa khóa cổ xưa có khả năng mở khóa những chiếc rương quý giá.', 'category_id' => $categoryIds['Dụng cụ'], 'image' => 'images/key.png', 'price' => 150],
            ['name' => 'Dây chuyền', 'description' => 'Một chiếc dây chuyền bạc đơn giản được chạm khắc một cách tỉ mỉ.', 'category_id' => $categoryIds['Trang sức'], 'image' => 'images/necklace.png', 'price' => 20],
            ['name' => 'Đá quý xanh (nhỏ)', 'description' => 'Một viên đá quý lấp lánh được tìm thấy trong những hang động sâu thẳm nhất.', 'category_id' => $categoryIds['Kho báu'], 'image' => 'images/gem_green_small.png', 'price' => 20],
            ['name' => 'Đá quý xanh (lớn)', 'description' => 'Một viên đá quý lấp lánh được tìm thấy trong những hang động sâu thẳm nhất.', 'category_id' => $categoryIds['Kho báu'], 'image' => 'images/gem_green_large.png', 'price' => 30],
            ['name' => 'Đá quý đỏ (nhỏ)', 'description' => 'Một viên đá quý lấp lánh được tìm thấy trong những hang động sâu thẳm nhất.', 'category_id' => $categoryIds['Kho báu'], 'image' => 'images/gem_red_large.png', 'price' => 30],
            ['name' => 'Đá quý đỏ (lớn)', 'description' => 'Một viên đá quý lấp lánh được tìm thấy trong những hang động sâu thẳm nhất.', 'category_id' => $categoryIds['Kho báu'], 'image' => 'images/gem_red_large.png', 'price' => 30],
            ['name' => 'Sách', 'description' => 'Một cuốn sách cũ kỹ, bìa được làm bằng da chứa đựng những thông tin quý giá.', 'category_id' => $categoryIds['Tài liệu'], 'image' => 'images/book.png', 'price' => 10],
            ['name' => 'Rương', 'description' => 'Một chiếc rương gỗ bị khóa chặt bởi một ổ khóa phức tạp.', 'category_id' => $categoryIds['Kho báu'], 'image' => 'images/chest.png', 'price' => 50],
            ['name' => 'Bánh Mì', 'description' => 'Một ổ bánh mì giòn rụm, đặc sản Việt Nam.', 'category_id' => $categoryIds['Thực phẩm'], 'image' => 'images/banhmi.png', 'price' => 20],
            ['name' => 'Bí Bầu', 'description' => 'Một quả bí tươi, dùng để nấu canh hoặc luộc.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/bau.png', 'price' => 15],
            ['name' => 'Bông Cải Xanh', 'description' => 'Bông cải xanh giàu dinh dưỡng, tốt cho sức khỏe.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/bongcai.png', 'price' => 25],
            ['name' => 'Cà Chua', 'description' => 'Những quả cà chua chín mọng, dùng để nấu ăn hoặc làm salad.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/cachua.png', 'price' => 10],
            ['name' => 'Bắp Cải', 'description' => 'Một cây bắp cải tươi ngon.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/caibap.png', 'price' => 12],
            ['name' => 'Cà Rốt', 'description' => 'Củ cà rốt giòn ngọt, tốt cho mắt.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/carot.png', 'price' => 8],
            ['name' => 'Củ Cải Trắng', 'description' => 'Củ cải trắng dùng để hầm xương hoặc kho thịt.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/cucai.png', 'price' => 9],
            ['name' => 'Ớt', 'description' => 'Vài quả ớt cay nồng, tăng thêm hương vị cho món ăn.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/ot.png', 'price' => 5],
            ['name' => 'Rau Muống', 'description' => 'Một bó rau muống xanh mướt, món ăn dân dã.', 'category_id' => $categoryIds['Rau củ'], 'image' => 'images/raumuong.png', 'price' => 7],
            ['name' => 'Nước Suối', 'description' => 'Một chai nước tinh khiết, giúp giải khát tức thì.', 'category_id' => $categoryIds['Đồ uống'], 'image' => 'images/chainuoc.png', 'price' => 10],
        ];

        $itemsToInsert = array_map(function ($item) use ($now) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;

            if (isset($item['image'])) {
                $item['image'] = Str::start($item['image'], '/');
            }

            return $item;
        }, $items);

        DB::table('items')->insert($itemsToInsert);
    }
}
