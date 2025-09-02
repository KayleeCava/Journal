import { ref, computed } from 'vue';
import axios from 'axios';

export function useRankings() {

    const rankings = ref({ data: [], links: {}, meta: {} });
    const currentUserProfile = ref(null);
    const isLoading = ref(true);
    const error = ref(null);

    const apiClient = axios.create({
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    const fetchRankings = async (url = '/api/achievements/ranking?per_page=10') => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await apiClient.get(url);
            rankings.value = response.data;
        } catch (err) {
            console.error("Lỗi khi tải bảng xếp hạng:", err);
            error.value = "Không thể tải dữ liệu bảng xếp hạng. Vui lòng thử lại sau.";
        } finally {
            isLoading.value = false;
        }
    };

    const fetchUserForModal = async (userId) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await apiClient.get(`/api/achievements/ranking/${userId}`);
            return response.data.data;
        } catch (err) {
            console.error(`Lỗi khi tải chi tiết người dùng ${userId}:`, err);
            error.value = `Không thể tìm thấy thông tin cho người dùng ID ${userId}.`;
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const loadUserProfileFromStorage = () => {
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                currentUserProfile.value = JSON.parse(userDataString);
            }
        } catch (err) {
            console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", err);
        }
    };

    const topThree = computed(() => {
        return rankings.value.meta?.current_page === 1 ? rankings.value.data.slice(0, 3) : [];
    });

    const restOfRankings = computed(() => {
        return rankings.value.meta?.current_page === 1 ? rankings.value.data.slice(3) : rankings.value.data;
    });

    const currentUserRankingData = computed(() => {
        const currentUserId = currentUserProfile.value?.user_id;

        if (!currentUserId) {
            return null;
        }

        return rankings.value.data?.find(player => player.user_id === currentUserId) || null;
    });

    const shouldShowCurrentUserRankBar = computed(() => {
        return currentUserRankingData.value && currentUserRankingData.value.rank > 3;
    });

    return {
        rankings,
        currentUserProfile,
        isLoading,
        error,
        topThree,
        restOfRankings,
        currentUserRankingData,
        shouldShowCurrentUserRankBar,

        fetchRankings,
        fetchUserForModal,
        loadUserProfileFromStorage,
    };
}
