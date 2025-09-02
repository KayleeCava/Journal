<script setup>
import { Link } from '@inertiajs/vue3';
import Modal from '@/Components/Modal.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';

defineProps({
    show: { type: Boolean, default: false },
    title: {
        type: String,
        default: 'Yêu cầu Đăng nhập'
    },
    message: {
        type: String,
        default: 'Bạn cần đăng nhập vào tài khoản để có thể sử dụng chức năng này.'
    }
});

const emit = defineEmits(['close']);
</script>

<template>
    <Modal :show="show" max-width="md" @close="emit('close')">
        <div class="p-6 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-4">
                <svg class="h-6 w-6 text-yellow-600 dark:text-yellow-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ title }}
            </h3>

            <div class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ message }}
                </p>
            </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/50 px-6 pb-4">
            <SecondaryButton class="w-full" @click="emit('close')">
                Để sau
            </SecondaryButton>
            <Link :href="route('login.index')" class="w-full">
                <PrimaryButton class="w-full">
                    Đăng nhập ngay
                </PrimaryButton>
            </Link>
        </div>
    </Modal>
</template>
