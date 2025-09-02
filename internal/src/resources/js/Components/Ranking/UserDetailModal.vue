<script setup>
import { computed } from "vue";

const props = defineProps({
    show: { type: Boolean, default: false },
    user: { type: Object, default: null }
});
const emit = defineEmits(['close']);

const formatUserDisplayName = (rawHtml) => {
    if (!rawHtml) return '';
    let processedHtml = rawHtml;

    const elementBlacklist = [
        'script', 'iframe', 'object', 'embed', 'link',
        'meta', 'img', 'video', 'audio', 'svg', 'a',
    ];
    elementBlacklist.forEach(tag => {
        const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>|<${tag}\\b[^>]*\\/?>`, 'gis');
        processedHtml = processedHtml.replace(regex, `<!-- ${tag} tag removed -->`);
    });

    const uriAttributePattern = /(href|src|data|action|formaction)\s*=\s*["']?\s*(javascript:|data:)/gi;
    processedHtml = processedHtml.replace(uriAttributePattern, '$1="about:blank"');

    const eventHandlerPattern = /\s(on[a-z]+)\s*=/gi;
    processedHtml = processedHtml.replace(eventHandlerPattern, ' data-sanitized-event=');

    return processedHtml;
};

const displayNameHtml = computed(() => {
    if (!props.user) return '';
    return formatUserDisplayName(props.user.name);
});

const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="show" @click.self="emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div v-if="user" class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
                    <div class="p-6 text-center relative border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white" v-html="displayNameHtml"></h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Chi tiết thành tích</p>
                        <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Đóng modal">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-8 space-y-5">
                        <div class="flex justify-center"><img :src="user.icon" class="w-28 h-28 drop-shadow-lg"></div>
                        <div class="space-y-3 text-lg">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-600 dark:text-gray-400">Thứ hạng:</span>
                                <span class="font-bold text-gray-900 dark:text-white">#{{ user.rank }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-600 dark:text-gray-400">Điểm số:</span>
                                <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ user.score }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-600 dark:text-gray-400">Thành tích:</span>
                                <span class="font-bold text-gray-900 dark:text-white text-right">{{ user.current_achievement }}</span>
                            </div>
                            <div class="flex justify-between items-start gap-4">
                                <span class="font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">Email:</span>
                                <!-- Thêm các class để xử lý text dài -->
                                <span class="font-bold text-gray-900 dark:text-white text-right break-words min-w-0">{{ user.email }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-gray-600 dark:text-gray-400">Tên tài khoản:</span>
                                <span class="font-bold text-gray-900 dark:text-white text-right">{{ user.username }}</span>
                            </div>
                        </div>
                        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Đạt được vào lúc</p>
                            <p class="font-semibold text-gray-700 dark:text-gray-300">{{ formatDate(user.achieved_at) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style> .modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; } .modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; } </style>
