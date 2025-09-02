<script setup>
import PrimaryButton from '@/Components/PrimaryButton.vue';

defineProps({
    item: Object,
    isOwned: Boolean,
    isAdding: Boolean,
    isInCart: Boolean,
});

const emit = defineEmits(['add-to-cart']);
</script>

<template>
    <div class="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

        <div class="h-40 flex items-center justify-center mb-4 rounded-md bg-gray-50 dark:bg-gray-700/50 p-2">
            <img :src="item.image" :alt="item.name" class="max-w-full max-h-full object-contain" />
        </div>

        <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex-grow flex items-center justify-center mb-2">
            {{ item.name }}
        </h3>

        <p class="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            {{ item.price }}
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Gold</span>
        </p>

        <div class="w-full mt-auto">
            <div v-if="isOwned" class="inline-flex items-center justify-center w-full px-4 py-2 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md font-semibold text-sm text-green-800 dark:text-green-300 uppercase tracking-widest cursor-default">
                Đã sở hữu
            </div>

            <div v-else-if="isInCart" class="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/50 border border-transparent rounded-md font-semibold text-sm text-blue-800 dark:text-blue-300 uppercase tracking-widest cursor-default">
                Trong giỏ hàng
            </div>

            <PrimaryButton v-else class="w-full" @click="emit('add-to-cart', item)" :loading="isAdding">
                Thêm vào giỏ
            </PrimaryButton>
        </div>
    </div>
</template>
