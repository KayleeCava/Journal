<script setup>
import { computed } from 'vue';

const props = defineProps({
    topThree: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['show-detail']);

const gridClass = computed(() => {
    const count = props.topThree.length;
    if (count === 1) {
        return 'grid-cols-1 justify-items-center';
    } else {
        return 'grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 items-end';
    }
});
</script>

<template>
    <section v-if="topThree.length > 0" :class="['grid', gridClass, 'mb-8']">

        <!-- Hạng 2 (Bạc) -->
        <div v-if="topThree[1]" @click="emit('show-detail', topThree[1])" class="order-2 md:order-1 bg-slate-200 dark:bg-slate-700 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer relative pt-10">
            <img src="/icons/ranking/rank2.png" alt="Hạng 2" class="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-14 drop-shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white truncate">{{ topThree[1].username }}</h3>
            <p class="text-2xl font-semibold text-slate-600 dark:text-slate-300">{{ topThree[1].score }} điểm</p>
        </div>

        <!-- Hạng 1 (Vàng) -->
        <div v-if="topThree[0]" @click="emit('show-detail', topThree[0])" class="order-1 md:order-2 bg-amber-200 dark:bg-amber-800/50 p-8 rounded-lg shadow-2xl text-center relative transform hover:-translate-y-3 transition-transform duration-300 cursor-pointer pt-12">
            <img src="/icons/ranking/rank1.png" alt="Hạng 1" class="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-16 drop-shadow-lg">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white truncate">{{ topThree[0].username }}</h3>
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ topThree[0].score }} điểm</p>
        </div>

        <!-- Hạng 3 (Đồng) -->
        <div v-if="topThree[2]" @click="emit('show-detail', topThree[2])" class="order-3 md:order-3 bg-orange-300/80 dark:bg-orange-900/60 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer relative pt-10">
            <img src="/icons/ranking/rank3.png" alt="Hạng 3" class="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-14 drop-shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white truncate">{{ topThree[2].username }}</h3>
            <p class="text-2xl font-semibold text-orange-700 dark:text-orange-400">{{ topThree[2].score }} điểm</p>
        </div>
    </section>
</template>
