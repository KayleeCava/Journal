<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    currentPage: {
        type: Number,
        required: true,
    },
    totalPages: {
        type: Number,
        required: true,
    },
    isLoading: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['update:currentPage']);

const pageInput = ref(props.currentPage);

watch(() => props.currentPage, (newPage) => {
    pageInput.value = newPage;
});

const goToInputPage = () => {
    let targetPage = parseInt(pageInput.value, 10);
    if (isNaN(targetPage) || targetPage < 1) {
        targetPage = 1;
    }
    if (targetPage > props.totalPages) {
        targetPage = props.totalPages;
    }
    pageInput.value = targetPage;
    emit('update:currentPage', targetPage);
};

const goToPage = (page) => {
    if (page >= 1 && page <= props.totalPages) {
        emit('update:currentPage', page);
    }
}
</script>

<template>
    <!-- THAY ĐỔI: Đồng bộ viền trên với Footer -->
    <div v-if="totalPages > 1 && !isLoading" class="flex-shrink-0 flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
        <!-- Nút "Trước" -->
        <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1 || isLoading"
            class="
            inline-flex items-center justify-center
            px-4 py-2
            bg-indigo-600 border border-transparent rounded-md
            font-semibold text-sm text-white
            uppercase tracking-widest
            hover:bg-indigo-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-800
            transition ease-in-out duration-150
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Trước
        </button>

        <!-- THAY ĐỔI: Đồng bộ màu chữ với Footer -->
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Trang</span>
            <input
                type="number"
                v-model.number="pageInput"
                @keyup.enter="goToInputPage"
                @blur="goToInputPage"
                :disabled="isLoading"
                class="
                w-16 text-center rounded-md shadow-sm transition
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-300
                focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span>/ {{ totalPages }}</span>
        </div>

        <!-- Nút "Sau" -->
        <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages || isLoading"
            class="
            inline-flex items-center justify-center
            px-4 py-2
            bg-indigo-600 border border-transparent rounded-md
            font-semibold text-sm text-white
            uppercase tracking-widest
            hover:bg-indigo-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-800
            transition ease-in-out duration-150
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Sau
        </button>
    </div>
</template>
