import { computed } from 'vue';

const getToken = () => localStorage.getItem('token');

export function useAuth() {
    const isUserLoggedIn = computed(() => !!getToken());

    return {
        isUserLoggedIn,
        getToken,
    };
}
