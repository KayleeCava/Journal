<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import Pagination from "@/Components/Pagination.vue";
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import InputError from '@/Components/InputError.vue';
import LoadingSpinner from "@/Components/LoadingSpinner.vue";
import AuthRequiredModal from '@/Components/AuthRequiredModal.vue';
import {
    EnvelopeIcon,
    CalendarDaysIcon,
    TrophyIcon,
    SparklesIcon,
    BanknotesIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/vue/24/outline';


const isInventoryLoading = ref(false);
const inventory = ref({ data: [], meta: {}, links: {} });
const inventoryCurrentPage = ref(1);
const inventoryTotalPages = computed(() => inventory.value.meta?.last_page || 1);

const showAuthModal = ref(false);
const userProfile = ref(null);
const isLoading = ref(true);
const apiError = ref('');
const updateForm = ref({
    name: '',
    bio: '',
    current_password: '',
    password: '',
    password_confirmation: '',
});
const isUpdating = ref(false);
const updateSuccessMessage = ref('');
const updateErrors = ref({});

onMounted(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        isLoading.value = false;
        showAuthModal.value = true;
        return;
    }

    Promise.all([
        fetchLatestProfile(),
        fetchInventory()
    ]).catch((error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showAuthModal.value = true;
        } else {
            apiError.value = 'Đã có lỗi xảy ra khi tải dữ liệu trang cá nhân.';
            console.error(error);
        }
    }).finally(() => {
        isLoading.value = false;
    });
});

const fetchLatestProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token không tồn tại");

    const response = await axios.get('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data) {
        userProfile.value = response.data.data;
        updateForm.value.name = userProfile.value.name;
        updateForm.value.bio = userProfile.value.bio || '';
        localStorage.setItem('user', JSON.stringify(response.data.data));
    }
};

const fetchInventory = async (page = 1) => {
    isInventoryLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token không tồn tại");

        const response = await axios.get(`/api/inventory?page=${page}&per_page=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data) {
            inventory.value = response.data;
        }
    } catch (error) {
        console.error("Lỗi khi tải lịch sử mua hàng:", error);
    } finally {
        isInventoryLoading.value = false;
    }
};

const handleProfileUpdate = async () => {
    isUpdating.value = true;
    updateSuccessMessage.value = '';
    updateErrors.value = {};

    const token = localStorage.getItem('token');
    if (!token) {
        updateErrors.value = { general: ['Phiên đăng nhập đã hết hạn.'] };
        isUpdating.value = false;
        return;
    }

    const payload = {
        name: updateForm.value.name,
        bio: updateForm.value.bio,
    };
    if (updateForm.value.current_password || updateForm.value.password) {
        payload.current_password = updateForm.value.current_password;
        payload.password = updateForm.value.password;
        payload.password_confirmation = updateForm.value.password_confirmation;
    }

    try {
        const response = await axios.patch('/api/profile', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        userProfile.value = response.data.data;
        localStorage.setItem('user', JSON.stringify(response.data.data));
        updateSuccessMessage.value = "Cập nhật thông tin thành công!";
        updateForm.value.current_password = '';
        updateForm.value.password = '';
        updateForm.value.password_confirmation = '';

    } catch (error) {
        if (error.response && error.response.status === 422) {
            updateErrors.value = error.response.data.errors;
        } else {
            updateErrors.value = { general: ['Đã có lỗi xảy ra. Vui lòng thử lại.'] };
            console.error("Lỗi cập nhật Profile:", error);
        }
    } finally {
        isUpdating.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
};

watch(inventoryCurrentPage, (newPage) => {
    fetchInventory(newPage);
});

</script>

<template>
    <Head title="Trang cá nhân" />

    <AuthRequiredModal
        :show="showAuthModal"
        @close="() => showAuthModal = false"
        title="Yêu cầu Đăng nhập"
        message="Vui lòng đăng nhập để xem thông tin cá nhân."
    />

    <AuthenticatedLayout>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

                <LoadingSpinner
                    v-if="isLoading"
                    text="Đang tải thông tin cá nhân và kho đồ..."
                    size="h-12 w-12"
                    padding="py-24"
                />

                <div v-else-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Lỗi!</strong>
                    <span class="block sm:inline">{{ apiError }}</span>
                </div>

                <div v-else class="grid grid-cols-1 lg:grid-cols-10 gap-8">

                    <!-- CỘT TRÁI (6/10): LỊCH SỬ MUA HÀNG -->
                    <div class="lg:col-span-6">
                        <div class="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">
                                Lịch Sử Mua Hàng
                            </h3>

                            <LoadingSpinner v-if="isInventoryLoading" text="Đang tải lịch sử..." padding="p-10" />

                            <div v-else>
                                <div v-if="inventory.data && inventory.data.length > 0">
                                    <div class="space-y-4">
                                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                            <li v-for="item in inventory.data" :key="item.item_id" class="py-4 flex items-center space-x-4">
                                                <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-md object-cover flex-shrink-0">
                                                <div class="flex-grow">
                                                    <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ item.name }}</h4>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ item.description }}</p>
                                                </div>
                                                <div class="text-right flex-shrink-0">
                                                    <p class="font-semibold text-gray-800 dark:text-gray-200">{{ item.price }} Vàng</p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Mua ngày: {{ formatDate(item.purchased_at) }}
                                                    </p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <!-- Component Pagination -->
                                    <div class="mt-6">
                                        <Pagination
                                            v-model:currentPage="inventoryCurrentPage"
                                            :total-pages="inventoryTotalPages"
                                            :is-loading="isInventoryLoading"
                                        />
                                    </div>
                                </div>

                                <div v-else class="text-center py-10">
                                    <p class="text-gray-500 dark:text-gray-400">Bạn chưa có lịch sử mua hàng.</p>
                                    <Link :href="route('shop.index')" class="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
                                        Đến cửa hàng ngay!
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CỘT PHẢI (4/10): THÔNG TIN & CẬP NHẬT -->
                    <div class="lg:col-span-4 space-y-8">
                        <div v-if="userProfile" class="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Thông tin chi tiết</h3>
                            <div class="flex items-start mb-4">
                                <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Tiểu sử</p>
                                    <p v-if="userProfile.bio" class="text-gray-800 dark:text-gray-200 italic">
                                        "{{ userProfile.bio }}"
                                    </p>
                                    <p v-else class="text-gray-400 dark:text-gray-500 text-sm">Chưa có tiểu sử.</p>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <TrophyIcon class="w-6 h-6 text-yellow-500 mr-3" />
                                    <div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Danh hiệu</p>
                                        <p class="font-semibold text-gray-800 dark:text-gray-200">{{ userProfile.achievement.name }}</p>
                                    </div>
                                    <img :src="userProfile.achievement.icon" :alt="userProfile.achievement.name" class="w-10 h-10 ml-auto">
                                </div>
                                <div class="flex items-center">
                                    <EnvelopeIcon class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
                                    <p class="text-gray-800 dark:text-gray-200">{{ userProfile.email }}</p>
                                </div>
                                <div class="flex items-center">
                                    <BanknotesIcon class="w-6 h-6 text-yellow-400 mr-3" />
                                    <p class="text-gray-800 dark:text-gray-200">{{ userProfile.gold }} Vàng</p>
                                </div>
                                <div class="flex items-center">
                                    <SparklesIcon class="w-6 h-6 text-blue-500 mr-3" />
                                    <p class="text-gray-800 dark:text-gray-200">{{ userProfile.score }} Điểm</p>
                                </div>
                                <div class="flex items-center">
                                    <CalendarDaysIcon class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
                                    <p class="text-gray-800 dark:text-gray-200">Tham gia ngày {{ formatDate(userProfile.joined_at) }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cập nhật thông tin</h3>

                            <form @submit.prevent="handleProfileUpdate" class="space-y-4">
                                <!-- Tên và Bio -->
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</label>
                                    <TextInput id="name" type="text" class="mt-1 block w-full" v-model="updateForm.name" required />
                                    <InputError class="mt-2" :message="updateErrors.name ? updateErrors.name[0] : ''" />
                                </div>
                                <div>
                                    <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tiểu sử</label>
                                    <textarea id="bio" v-model="updateForm.bio" rows="3" class="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" placeholder="Hãy chia sẻ một chút về bạn..."></textarea>
                                    <InputError class="mt-2" :message="updateErrors.bio ? updateErrors.bio[0] : ''" />
                                </div>

                                <!-- Phân tách phần đổi mật khẩu -->
                                <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Để trống các trường dưới đây nếu bạn không muốn thay đổi mật khẩu.</p>

                                    <!-- Trường Mật khẩu cũ -->
                                    <div>
                                        <label for="current_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu hiện tại</label>
                                        <TextInput id="current_password" type="password" class="mt-1 block w-full" v-model="updateForm.current_password" />
                                        <InputError class="mt-2" :message="updateErrors.current_password ? updateErrors.current_password[0] : ''" />
                                    </div>

                                    <!-- Trường Mật khẩu mới -->
                                    <div>
                                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu mới</label>
                                        <TextInput id="password" type="password" class="mt-1 block w-full" v-model="updateForm.password" />
                                        <InputError class="mt-2" :message="updateErrors.password ? updateErrors.password[0] : ''" />
                                    </div>

                                    <!-- Trường Xác nhận mật khẩu mới -->
                                    <div>
                                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu mới</label>
                                        <TextInput id="password_confirmation" type="password" class="mt-1 block w-full" v-model="updateForm.password_confirmation" />
                                    </div>
                                </div>

                                <!-- Nút Lưu thay đổi (đã có sẵn) -->
                                <div class="pt-2">
                                    <PrimaryButton class="w-full flex justify-center" :loading="isUpdating" :disabled="isUpdating">
                                        Lưu thay đổi
                                    </PrimaryButton>
                                </div>

                                <!-- Thông báo lỗi và thành công -->
                                <div v-if="updateSuccessMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">
                                    {{ updateSuccessMessage }}
                                </div>
                                <div v-if="updateErrors.general" class="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {{ updateErrors.general[0] }}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
