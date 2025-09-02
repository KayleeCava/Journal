<script setup>
import { ref } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import axios from 'axios';
import Checkbox from '@/Components/Checkbox.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';

const email = ref('');
const password = ref('');
const remember = ref(false);
const isLoading = ref(false);
const apiError = ref('');

defineProps({
    canResetPassword: { type: Boolean },
    status: { type: String },
});

const submit = async () => {
    apiError.value = '';
    isLoading.value = true;
    try {
        const response = await axios.post('/api/login', {
            email: email.value,
            password: password.value,
        });

        if (response.data.data.token) {
            const token = response.data.data.token;
            const user = response.data.data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.get(route('home'), {}, {
                onFinish: () => {
                    password.value = '';
                }
            });
        }
    } catch (error) {
        if (error.response?.data?.message) {
            apiError.value = error.response.data.message;
        } else {
            apiError.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
        password.value = '';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <Head title="Đăng nhập" />

    <div class="flex min-h-screen bg-white dark:bg-gray-900">
        <!-- Form đăng nhập - căn giữa toàn màn hình -->
        <div class="w-full flex items-center justify-center p-8 sm:p-12">
            <div class="w-full max-w-md">

                <!-- Logo và Tiêu đề -->
                <div class="text-center mb-10">
                    <Link :href="route('home')" class="inline-block mb-4">
                        <ApplicationLogo class="w-20 h-20 fill-current text-gray-500" />
                    </Link>
                    <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Chào mừng trở lại!</h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Đăng nhập để tiếp tục khám phá cộng đồng.
                    </p>
                </div>

                <!-- Hiển thị lỗi hoặc trạng thái -->
                <div v-if="status" class="mb-4 font-medium text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/50 rounded-md">
                    {{ status }}
                </div>
                <div v-if="apiError" class="mb-4 font-medium text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/50 rounded-md">
                    {{ apiError }}
                </div>

                <!-- Form đăng nhập -->
                <form @submit.prevent="submit" class="space-y-5">
                    <div>
                        <InputLabel for="email" value="Email" class="sr-only" />
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                class="pl-10 block w-full"
                                v-model="email"
                                required
                                placeholder="your.email@example.com"
                                autocomplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel for="password" value="Password" class="sr-only" />
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                class="pl-10 block w-full"
                                v-model="password"
                                required
                                placeholder="Mật khẩu"
                                autocomplete="current-password"
                            />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <Checkbox name="remember" v-model:checked="remember" />
                            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Ghi nhớ đăng nhập</span>
                        </label>
                        <Link
                            v-if="canResetPassword"
                            :href="route('password.request')"
                            class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <!-- Nút Đăng nhập -->
                    <div>
                        <PrimaryButton class="w-full flex justify-center" :class="{ 'opacity-25': isLoading }" :disabled="isLoading">

                            <!-- HIỂN THỊ KHI ĐANG LOADING -->
                            <div v-if="isLoading" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <!-- <img src="/logo.png" alt="logo.png"></img> -->
                            </div>
                            <span v-else>
                            Đăng nhập
                            </span>
                        </PrimaryButton>
                    </div>
                </form>

                <!-- Link đến trang Đăng ký -->
                <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản?
                    <Link :href="route('register.index')" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Đăng ký ngay
                    </Link>
                </p>

            </div>
        </div>
    </div>
</template>
