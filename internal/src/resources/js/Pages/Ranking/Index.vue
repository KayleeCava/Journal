<script setup>
import {ref, onMounted, onUnmounted, computed, watch} from 'vue'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import RankingPodium from "@/Components/Ranking/RankingPodium.vue";
import CurrentUserRankBar from "@/Components/Ranking/CurrentUserRankBar.vue";
import RankingList from "@/Components/Ranking/RankingList.vue";
import UserDetailModal from "@/Components/Ranking/UserDetailModal.vue";
import Pagination from "@/Components/Pagination.vue";
import { useRankings } from '@/Composables/Ranking/useRankings.js';

const {
    rankings,
    currentUserProfile,
    isLoading,
    error,
    topThree,
    restOfRankings,
    currentUserRankingData,
    shouldShowCurrentUserRankBar,
    fetchRankings,
    loadUserProfileFromStorage,
    fetchUserForModal,
} = useRankings();

const currentPage = ref(1);
const postsPerPage = ref(10);

const totalPages = computed(() => rankings.value.meta?.last_page || 1);

const selectedUser = ref(null);
const isModalVisible = ref(false);

const showUserDetail = (user) => {
    selectedUser.value = user;
    isModalVisible.value = true;

    const newUrl = `/ranking/user/${user.user_id}`;
    if (window.location.pathname !== newUrl) {
        history.pushState({ userId: user.user_id }, '', newUrl);
    }
};

const closeModal = () => {
    isModalVisible.value = false;
    if (window.location.pathname !== '/ranking') {
        history.pushState({}, '', '/ranking');
    }

    setTimeout(() => { selectedUser.value = null; }, 300);
};

const handleUrlChange = async () => {
    const matches = window.location.pathname.match(/\/ranking\/user\/(\d+)/);

    if (matches && matches[1]) {
        const userIdFromUrl = matches[1];
        if (!isModalVisible.value || selectedUser.value?.user_id.toString() !== userIdFromUrl) {
            const userToShow = await fetchUserForModal(userIdFromUrl);
            if (userToShow) {
                selectedUser.value = userToShow;
                isModalVisible.value = true;
            } else {
                closeModal();
            }
        }
    } else {
        if (isModalVisible.value) {
            isModalVisible.value = false;
            setTimeout(() => { selectedUser.value = null; }, 300);
        }
    }
};

watch(currentPage, (newPage) => {
    const newUrl = `/api/achievements/ranking?page=${newPage}&per_page=${postsPerPage.value}`;
    fetchRankings(newUrl);
}, { immediate: false });

onMounted(async () => {
    loadUserProfileFromStorage();
    await fetchRankings('/api/achievements/ranking?page=1&per_page=10');
    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();
});

onUnmounted(() => {
    window.removeEventListener('popstate', handleUrlChange);
});
</script>

<template>
    <AuthenticatedLayout>
        <div class="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">

                <header class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl">Bảng Xếp Hạng Thành Tích</h1>
                    <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">Vinh danh những người chơi xuất sắc nhất qua từng cột mốc.</p>
                </header>

                <!-- Loading & Error States -->
                <div v-if="isLoading" class="text-center py-20">
                    <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <!-- <img src="/logo.png" alt="logo.png"></img> -->
                    <p class="mt-4 text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
                <div v-else-if="error" class="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-xl font-semibold text-red-600 dark:text-red-400">Đã xảy ra lỗi</p>
                    <p class="mt-2 text-gray-600 dark:text-gray-300">{{ error }}</p>
                </div>

                <!-- Main Content -->
                <div v-else-if="rankings && rankings.data.length > 0">
                    <RankingPodium :top-three="topThree" @show-detail="showUserDetail" />
                    <CurrentUserRankBar v-if="shouldShowCurrentUserRankBar" :ranking-data="currentUserRankingData" :user-profile="currentUserProfile" />
                    <RankingList :players="restOfRankings" :current-user-profile="currentUserProfile" @show-detail="showUserDetail" />
                    <div class="mt-8">
                        <Pagination
                            v-model:currentPage="currentPage"
                            :total-pages="totalPages"
                            :is-loading="isLoading"
                        />
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-20">
                    <p class="text-lg text-gray-500 dark:text-gray-400">Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên!</p>
                </div>
            </div>
        </div>

        <UserDetailModal :show="isModalVisible" :user="selectedUser" @close="closeModal" />
    </AuthenticatedLayout>
</template>
