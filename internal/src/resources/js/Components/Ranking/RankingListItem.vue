<script setup>
defineProps({
    player: { type: Object, required: true },
    isCurrentUser: { type: Boolean, default: false },
});

const emit = defineEmits(['show-detail']);
</script>

<template>
    <li @click="emit('show-detail', player)"
        class="flex items-center p-4 transition duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
        :class="{ 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500': isCurrentUser }">

        <div class="w-16 text-center">
            <span class="text-xl font-bold text-gray-500 dark:text-gray-400">{{ player.rank }}</span>
        </div>

        <div class="flex-1 flex items-center space-x-4">
            <img class="h-12 w-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700" :src="`https://ui-avatars.com/api/?name=${player.username.replace(' ', '+')}&background=random&color=fff`" :alt="`Avatar của ${player.username}`">
            <p class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {{ player.username }}
                <span v-if="isCurrentUser" class="ml-2 text-xs font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full align-middle">BẠN</span>
            </p>
        </div>

        <div class="w-24 text-right">
            <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ player.score }}</span>
        </div>
    </li>
</template>
