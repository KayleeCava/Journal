<script setup>
import { ref } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import axios from 'axios';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import InputError from '@/Components/InputError.vue';

const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');

const isLoading = ref(false);
const formErrors = ref({});
const generalApiError = ref('');

const submit = async () => {
    formErrors.value = {};
    generalApiError.value = '';
    isLoading.value = true;

    try {
        const response = await axios.post('/api/register', {
            name: name.value,
            username: username.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value,
        });

        if (response.data.data.token) {
            const token = response.data.data.token;
            const user = response.data.data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            router.get(route('home'));
        }

    } catch (error) {
        if (error.response && error.response.status === 422) {
            formErrors.value = error.response.data.errors;
        } else {
            generalApiError.value = 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.';
            console.error('API Error:', error);
        }
        password.value = '';
        password_confirmation.value = '';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <Head title="Đăng ký" />

    <div class="flex min-h-screen bg-white dark:bg-gray-900">
        <div class="w-full flex items-center justify-center p-8 sm:p-12">
            <div class="w-full max-w-md">

                <div class="text-center mb-10">
                    <Link :href="route('home')" class="inline-block mb-4">
                        <ApplicationLogo class="w-20 h-20 fill-current text-gray-500" />
                    </Link>
                    <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Tạo tài khoản mới</h1>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Tham gia cộng đồng và bắt đầu khám phá ngay hôm nay.
                    </p>
                </div>

                <!-- Hiển thị lỗi chung từ API -->
                <div v-if="generalApiError" class="mb-4 font-medium text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/50 rounded-md">
                    {{ generalApiError }}
                </div>

                <form @submit.prevent="submit" class="space-y-5">
                    <!-- Tên đăng nhập -->
                    <div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <TextInput id="username" type="text" class="pl-10 block w-full" v-model="username" required autofocus placeholder="Tên đăng nhập" />
                        </div>
                        <InputError class="mt-2" :message="formErrors.username ? formErrors.username[0] : ''" />
                    </div>

                    <!-- Họ và tên -->
                    <div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <!-- <img src="/logo.png" alt="logo.png"></img> -->
                            </div>
                            <TextInput id="name" type="text" class="pl-10 block w-full" v-model="name" required placeholder="Họ và tên" />
                        </div>
                        <InputError class="mt-2" :message="formErrors.name ? formErrors.name[0] : ''" />
                    </div>

                    <!-- Email -->
                    <div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <TextInput id="email" type="email" class="pl-10 block w-full" v-model="email" required placeholder="your.email@example.com" />
                        </div>
                        <InputError class="mt-2" :message="formErrors.email ? formErrors.email[0] : ''" />
                    </div>

                    <!-- Mật khẩu -->
                    <div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <TextInput id="password" type="password" class="pl-10 block w-full" v-model="password" required placeholder="Mật khẩu" />
                        </div>
                        <InputError class="mt-2" :message="formErrors.password ? formErrors.password[0] : ''" />
                    </div>

                    <!-- Xác nhận Mật khẩu -->
                    <div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <TextInput id="password_confirmation" type="password" class="pl-10 block w-full" v-model="password_confirmation" required placeholder="Xác nhận mật khẩu" />
                        </div>
                    </div>

                    <!-- Nút Đăng ký -->
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

                            <!-- HIỂN THỊ KHI Ở TRẠNG THÁI BÌNH THƯỜNG -->
                            <span v-else>
                            Đăng ký
                            </span>
                        </PrimaryButton>
                    </div>
                </form>

                <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Đã có tài khoản?
                    <Link :href="route('login.index')" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Đăng nhập ngay
                    </Link>
                </p>

            </div>
        </div>
    </div>
</template>
