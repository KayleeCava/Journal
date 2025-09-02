import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useAuth } from './useAuth';

export function useShop() {
    const { isUserLoggedIn, getToken } = useAuth();

    const apiClient = axios.create({
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    apiClient.interceptors.request.use(config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, error => Promise.reject(error));

    const allItems = ref([]);
    const categories = ref([]);
    const selectedCategory = ref(null);
    const searchQuery = ref('');
    const sortBy = ref('date-desc');
    const currentPage = ref(1);
    const totalPages = ref(1);
    const itemsPerPage = ref(6);
    const isShopLoading = ref(true);
    const shopError = ref(null);

    const serverCart = ref(null);
    const checkoutResult = ref(null);
    const checkoutErrorData = ref(null);
    const isCartLoading = ref(false);
    const isCheckingOut = ref(false);
    const isAddingItemId = ref(null);
    const cartError = ref(null);

    const ownedItemIds = ref(new Set());
    const itemIdsInCart = ref(new Set());

    const cartItems = computed(() => serverCart.value?.data?.items || []);
    const cartTotal = computed(() => serverCart.value?.data?.total_price || 0);

    const fetchShopItems = async () => {
        isShopLoading.value = true;
        shopError.value = null;
        const [sort_by, sort_dir] = sortBy.value.split('-');
        try {
            const params = new URLSearchParams({
                search: searchQuery.value,
                category_id: selectedCategory.value || '',
                sort_by: sort_by === 'date' ? 'created_at' : sort_by,
                sort_dir,
                page: currentPage.value,
                per_page: itemsPerPage.value,
            });
            const response = await apiClient.get(`/api/items?${params.toString()}`);
            allItems.value = response.data.data;
            if (response.data.meta) {
                totalPages.value = response.data.meta.last_page;
                currentPage.value = response.data.meta.current_page;
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách vật phẩm:", error);
            shopError.value = "Không thể tải danh sách vật phẩm.";
        } finally {
            isShopLoading.value = false;
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/api/categories');
            categories.value = response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    const fetchInventory = async () => {
        if (!isUserLoggedIn.value) return;
        try {
            const response = await apiClient.get('/api/inventory?page=1&per_page=20');
            ownedItemIds.value = new Set(response.data.data.map(item => item.id));
        } catch (error) {
            console.error("Không thể tải kho đồ:", error);
        }
    };

    const isItemOwned = (itemId) => ownedItemIds.value.has(itemId);

    const fetchCart = async () => {
        if (!isUserLoggedIn.value) return;
        isCartLoading.value = true;
        cartError.value = null;
        try {
            const response = await apiClient.get('/api/cart');
            serverCart.value = response.data;

            if (response.data?.data?.items) {
                itemIdsInCart.value = new Set(response.data.data.items.map(cartItem => cartItem.item.id));
            } else {
                itemIdsInCart.value = new Set();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                serverCart.value = null;
                itemIdsInCart.value = new Set();
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                cartError.value = "Không thể tải giỏ hàng.";
            }
        } finally {
            isCartLoading.value = false;
        }
    };

    const addToCart = async (item, onAuthRequired) => {
        if (!isUserLoggedIn.value) {
            onAuthRequired();
            return;
        }
        isAddingItemId.value = item.id;
        cartError.value = null;
        try {
            await apiClient.post('/api/cart', { item_ids: [item.id] });
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            cartError.value = error.response?.data?.message || "Thêm vật phẩm thất bại.";
        } finally {
            isAddingItemId.value = null;
        }
    };

    const isItemInCart = (itemId) => {
        return itemIdsInCart.value.has(itemId);
    };

    const removeFromCart = async (cartItemId) => {
        await apiClient.delete('/api/cart/items', { data: { cart_item_ids: [cartItemId] } });
        await fetchCart();
    };

    const clearCart = async () => {
        try {
            const idsToRemove = cartItems.value.map(item => item.cart_item_id);
            if (idsToRemove.length === 0) return;

            await apiClient.delete('/api/cart/items', { data: { cart_item_ids: idsToRemove } });

            serverCart.value = null;
            itemIdsInCart.value = new Set();
            cartError.value = null;
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            cartError.value = "Không thể xóa giỏ hàng.";
        }
    };

    const checkout = async () => {
        isCheckingOut.value = true;
        cartError.value = null;
        checkoutErrorData.value = null;
        try {
            const response = await apiClient.post('/api/cart/checkout');
            checkoutResult.value = response.data;
            serverCart.value = null;
            await fetchInventory();
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error.response);

            if (error.response?.status === 422) {
                checkoutErrorData.value = {
                    message: 'Bạn không đủ vàng.',
                    details: error.response.data.data
                };
            } else {
                cartError.value = error.response?.data?.message || "Thanh toán thất bại.";
            }

            return { success: false };
        } finally {
            isCheckingOut.value = false;
        }
    };

    watch([selectedCategory, searchQuery, sortBy], () => {
        currentPage.value = 1;
        fetchShopItems();
    });
    watch(currentPage, fetchShopItems);

    return {
        allItems,
        categories,
        selectedCategory,
        searchQuery,
        sortBy,
        currentPage,
        totalPages,
        isShopLoading,
        shopError,
        isUserLoggedIn,
        cartItems,
        cartTotal,
        isCartLoading,
        isCheckingOut,
        isAddingItemId,
        cartError,
        checkoutResult,
        checkoutErrorData,

        fetchShopItems,
        fetchCategories,
        fetchCart,
        fetchInventory,
        isItemOwned,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        isItemInCart,
    };
}
