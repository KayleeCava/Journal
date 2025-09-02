<script setup>
defineProps({
    rankingData: { type: Object, required: true },
    userProfile: { type: Object, required: true },
});
</script>

<template>
    <section class="mb-8" aria-label="Thứ hạng của bạn">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-indigo-500 flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <span class="text-2xl font-bold text-gray-700 dark:text-gray-200 w-12 text-center flex-shrink-0">#{{ rankingData.rank }}</span>
                <img class="h-12 w-12 rounded-full object-cover flex-shrink-0" :src="`https://ui-avatars.com/api/?name=${userProfile.name.replace(' ', '+')}&background=random&color=fff`" :alt="userProfile.name">
                <div class="min-w-0">
                    <p class="text-lg font-semibold text-indigo-800 dark:text-indigo-300 truncate">{{ userProfile.name }}</p>
                </div>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
                <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ rankingData.score }} điểm</span>
            </div>
        </div>
    </section>
</template>
