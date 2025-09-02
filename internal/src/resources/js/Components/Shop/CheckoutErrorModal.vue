<script setup>
import Modal from '@/Components/Modal.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';

defineProps({
    show: { type: Boolean, default: false },
    title: {
        type: String,
        default: 'Thanh toán thất bại'
    },
    message: {
        type: String,
        default: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    },

    details: {
        type: Object,
        default: null,
    }
});

const emit = defineEmits(['close']);
</script>

<template>
    <Modal :show="show" max-width="md" @close="emit('close')">
        <div class="p-6 text-center">
            <!-- Thay icon màu vàng bằng icon màu đỏ để báo lỗi -->
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

            <!-- Hiển thị chi tiết số vàng nếu có -->
            <div v-if="details" class="mt-4 text-sm text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Vàng hiện có:</span>
                    <span class="font-semibold text-yellow-500">{{ details.current_gold?.toLocaleString() }} Gold</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Yêu cầu:</span>
                    <span class="font-semibold text-red-500">{{ details.required_gold?.toLocaleString() }} Gold</span>
                </div>
            </div>

        </div>

        <div class="bg-gray-50 dark:bg-gray-800/50 px-6 pb-4">
            <PrimaryButton class="w-full" @click="emit('close')">
                Đã hiểu
            </PrimaryButton>
        </div>
    </Modal>
</template>
