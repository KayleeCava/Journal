<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';

defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    result: {
        type: Object,
        default: () => null,
    },
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>

<template>
    <TransitionRoot appear :show="show" as="template">
        <Dialog @close="close" class="relative z-50">
            <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-full mb-4">
                                    <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>

                                <DialogTitle as="h3" class="text-2xl font-bold leading-6 text-gray-900 dark:text-white">
                                    Thanh toán thành công!
                                </DialogTitle>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        {{ result?.message }}
                                    </p>
                                </div>
                            </div>

                            <div v-if="result?.data" class="mt-6 space-y-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                                <div class="flex justify-between items-center text-base">
                                    <span class="font-medium text-gray-600 dark:text-gray-300">Tổng chi tiêu:</span>
                                    <span class="font-bold text-red-500">-{{ result.data.total_paid?.toLocaleString() }} Gold</span>
                                </div>
                                <div class="flex justify-between items-center text-base">
                                    <span class="font-medium text-gray-600 dark:text-gray-300">Số vàng còn lại:</span>
                                    <span class="font-bold text-green-500">{{ result.data.remaining_gold?.toLocaleString() }} Gold</span>
                                </div>
                            </div>

                            <div v-if="result?.data?.purchased_items.length" class="mt-6">
                                <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Vật phẩm đã nhận:</h4>
                                <ul class="space-y-2 max-h-40 overflow-y-auto rounded-md border dark:border-gray-700 p-2 custom-scrollbar">
                                    <li v-for="purchased in result.data.purchased_items" :key="purchased.id" class="flex items-center space-x-3 p-1">
                                        <img :src="purchased.item.image" :alt="purchased.item.name" class="w-10 h-10 object-contain bg-white dark:bg-gray-800 rounded">
                                        <span class="text-sm text-gray-800 dark:text-gray-200">{{ purchased.item.name }}</span>
                                    </li>
                                </ul>
                            </div>

                            <div class="mt-6">
                                <PrimaryButton class="w-full" @click="close">
                                    Tiếp Tục Mua Sản Phẩm
                                </PrimaryButton>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
