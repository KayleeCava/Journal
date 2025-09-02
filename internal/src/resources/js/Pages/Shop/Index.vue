<script setup>
import { ref, onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

import LoadingSpinner from '@/Components/LoadingSpinner.vue';
import AuthRequiredModal from '@/Components/AuthRequiredModal.vue';
import ShopItemCard from '@/Components/Shop/ShopItemCard.vue';
import ShoppingCart from '@/Components/Shop/ShoppingCart.vue';
import CheckoutSuccessModal from '@/Components/Shop/CheckoutSuccessModal.vue';
import CheckoutErrorModal from '@/Components/Shop/CheckoutErrorModal.vue';
import Pagination from '@/Components/Pagination.vue';
import { useShop } from '@/Composables/Shop/useShop';

const {
    allItems, categories, selectedCategory, searchQuery, sortBy, currentPage, totalPages,
    isShopLoading, shopError, isUserLoggedIn, cartItems, cartTotal, isCartLoading, isCheckingOut,
    isAddingItemId, cartError, checkoutResult, checkoutErrorData,

    fetchShopItems, fetchCategories, fetchCart, fetchInventory, isItemOwned,
    addToCart, removeFromCart, clearCart, checkout, isItemInCart
} = useShop();


const isCheckoutModalVisible = ref(false);
const isCheckoutErrorModalVisible = ref(false);
const isAuthModalVisible = ref(false);

const handleAddToCart = (item) => {
    addToCart(item, () => {
        isAuthModalVisible.value = true;
    });
};

const handleCheckout = async () => {
    const { success } = await checkout();
    if (success) {
        isCheckoutModalVisible.value = true;
    } else {
        if (checkoutErrorData.value) {
            isCheckoutErrorModalVisible.value = true;
        }
    }
};

onMounted(() => {
    fetchCategories();
    fetchShopItems();
    fetchCart();
    fetchInventory();
});
</script>

<template>
    <AuthenticatedLayout>
        <div class="flex flex-col min-h-[calc(100vh-4rem)]">

            <main class="flex-grow">
                <div class="py-12">
                    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            <!-- Sidebar trái: Danh mục -->
                            <div class="lg:col-span-2">
                                <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-4 top-24">
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Danh Mục</h3>
                                    <ul class="space-y-2">
                                        <li><button @click="selectedCategory = null" :class="['w-full text-left px-3 py-2 rounded-md text-sm font-medium transition', selectedCategory === null ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']">Tất Cả</button></li>
                                        <li v-for="category in categories" :key="category.id"><button @click="selectedCategory = category.id" :class="['w-full text-left px-3 py-2 rounded-md text-sm font-medium transition', selectedCategory === category.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']">{{ category.name }}</button></li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Nội dung giữa: Danh sách vật phẩm -->
                            <div class="lg:col-span-7">
                                <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-4 mb-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm vật phẩm..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        <select v-model="sortBy" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="date-desc">Mới nhất</option>
                                            <option value="date-asc">Cũ nhất</option>
                                            <option value="price-asc">Giá: Tăng dần</option>
                                            <option value="price-desc">Giá: Giảm dần</option>
                                        </select>
                                    </div>
                                </div>

                                <LoadingSpinner v-if="isShopLoading" text="Đang tải vật phẩm..." padding="p-10" />

                                <div v-else-if="shopError" class="text-center text-red-500 p-10">{{ shopError }}</div>
                                <div v-else-if="allItems.length > 0">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <ShopItemCard
                                            v-for="item in allItems"
                                            :key="item.id"
                                            :item="item"
                                            :is-owned="isItemOwned(item.id)"
                                            :is-adding="isAddingItemId === item.id"
                                            :is-in-cart="isItemInCart(item.id)"
                                            @add-to-cart="handleAddToCart"
                                        />
                                    </div>

                                    <div class="mt-8">
                                        <Pagination
                                            v-model:currentPage="currentPage"
                                            :total-pages="totalPages"
                                            :is-loading="isShopLoading"
                                        />
                                    </div>

                                </div>

                                <div v-else class="text-center bg-white dark:bg-gray-800 shadow sm:rounded-lg p-10">
                                    <p class="text-gray-500 dark:text-gray-400">Không tìm thấy vật phẩm nào phù hợp.</p>
                                </div>
                            </div>

                            <!-- Sidebar phải: Giỏ hàng -->
                            <div class="lg:col-span-3">
                                <ShoppingCart
                                    :is-logged-in="isUserLoggedIn"
                                    :is-loading="isCartLoading"
                                    :is-checking-out="isCheckingOut"
                                    :error="cartError"
                                    :items="cartItems"
                                    :total="cartTotal"
                                    @remove-item="removeFromCart"
                                    @clear-cart="clearCart"
                                    @checkout="handleCheckout"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <CheckoutSuccessModal
            :show="isCheckoutModalVisible"
            :result="checkoutResult"
            @close="isCheckoutModalVisible = false"
        />
        <AuthRequiredModal
            :show="isAuthModalVisible"
            @close="isAuthModalVisible = false"
            title="Yêu cầu Đăng nhập"
            message="Vui lòng đăng nhập để có thể mua vật phẩm."
        />

        <CheckoutErrorModal
            :show="isCheckoutErrorModalVisible"
            title="Không thể thanh toán"
            :message="checkoutErrorData?.message"
            :details="checkoutErrorData?.details"
            @close="isCheckoutErrorModalVisible = false"
        />
    </AuthenticatedLayout>
</template>
