<script setup>
import PrimaryButton from '@/Components/PrimaryButton.vue';
import LoadingSpinner from '@/Components/LoadingSpinner.vue';

defineProps({
    isLoggedIn: Boolean,
    isLoading: Boolean,
    isCheckingOut: Boolean,
    error: String,
    items: Array,
    total: Number,
});

const emit = defineEmits(['remove-item', 'clear-cart', 'checkout']);
</script>

<template>
    <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-4 top-24">
        <div class="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Giỏ Hàng</h3>
            <button v-if="items.length > 0" @click="emit('clear-cart')" class="text-sm text-gray-500 hover:text-red-500 hover:underline transition-colors">
                Xóa tất cả
            </button>
        </div>

        <div v-if="!isLoggedIn" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">Vui lòng <a href="/login" class="text-indigo-500 hover:underline">đăng nhập</a> để xem giỏ hàng.</p>
        </div>
        <div v-else>
            <LoadingSpinner v-if="isLoading" text="Đang tải giỏ hàng..." padding="py-8" size="h-6 w-6"/>
            <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
            <div v-else-if="items.length > 0">
                <ul class="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <li v-for="cartItem in items" :key="cartItem.cart_item_id" class="flex justify-between items-center">
                        <div class="flex items-center space-x-3">
                            <img :src="cartItem.item.image" :alt="cartItem.item.name" class="w-10 h-10 object-contain rounded bg-gray-100 dark:bg-gray-700">
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ cartItem.item.name }}</p>
                                <p class="text-xs text-indigo-500 dark:text-indigo-400">{{ cartItem.item.price }} Gold</p>
                            </div>
                        </div>
                        <button @click="emit('remove-item', cartItem.cart_item_id)" title="Xóa vật phẩm" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xl">&times;</button>
                    </li>
                </ul>
                <div class="mt-6 border-t dark:border-gray-700 pt-4">
                    <div class="flex justify-between items-center font-bold text-lg">
                        <span class="text-gray-800 dark:text-gray-200">Tổng cộng:</span>
                        <span class="text-indigo-600 dark:text-indigo-400">{{ total }} Gold</span>
                    </div>
                    <PrimaryButton class="w-full mt-4" @click="emit('checkout')" :loading="isCheckingOut" :disabled="items.length === 0">
                        Thanh Toán
                    </PrimaryButton>
                </div>
            </div>
            <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">Giỏ hàng của bạn đang trống.</div>
        </div>
    </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 10px;
}
</style>
