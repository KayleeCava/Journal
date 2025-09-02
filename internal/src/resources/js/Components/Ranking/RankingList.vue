<script setup>
import RankingListItem from './RankingListItem.vue';

defineProps({
    players: { type: Array, required: true },
    currentUserProfile: { type: Object, default: null },
});

const emit = defineEmits(['show-detail']);
</script>

<template>
    <section class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
            <li class="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                <div class="w-16 text-left pl-2">Hạng</div>
                <div class="flex-1">Người chơi</div>
                <div class="w-24 text-right pr-2">Điểm</div>
            </li>
            <RankingListItem
                v-for="player in players"
                :key="player.rank"
                :player="player"
                :is-current-user="currentUserProfile && player.user_id === currentUserProfile.user_id"
                @show-detail="emit('show-detail', player)"
            />
        </ul>
    </section>
</template>
