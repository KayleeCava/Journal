<script setup>
import { Link } from '@inertiajs/vue3';
import Modal from '@/Components/Modal.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';

defineProps({
    show: { type: Boolean, default: false }
});

// Component này không cần emit 'close' vì cách duy nhất để đóng là quay về trang chủ.
</script>

<template>
    <Modal :show="show" max-width="md" :closeable="false">
        <div class="p-6 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Truy cập bị từ chối
            </h3>

            <div class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Bạn không có quyền để xem nội dung này.
                </p>
            </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800/50 px-6 pb-4">
            <Link :href="route('home')" class="w-full">
                <PrimaryButton class="w-full">
                    Quay về trang chủ
                </PrimaryButton>
            </Link>
        </div>
    </Modal>
</template>
