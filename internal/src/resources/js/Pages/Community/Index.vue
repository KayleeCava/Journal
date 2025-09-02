<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { GlobeAltIcon, LockClosedIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid';
import axios from 'axios';
import LoadingSpinner from "@/Components/LoadingSpinner.vue";
import AuthRequiredModal from '@/Components/AuthRequiredModal.vue';
import PrimaryButton from "@/Components/PrimaryButton.vue";
import Pagination from "@/Components/Pagination.vue";
import MarkdownEditor from '@/Components/Community/MarkdownEditor.vue';

const currentUser = ref(null);
const posts = ref([]);
const isPostsLoading = ref(true);
const postsError = ref(null);

const topics = ref([]);
const isTopicsLoading = ref(false);
const topicsError = ref(null);
const activeFilter = ref('all');

const searchQuery = ref('');
const sortBy = ref('created_at-desc');
const status = ref('public');
const selectedTopicId = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const postsPerPage = ref(10);

const showCreateForm = ref(false);
const isAuthModalVisible = ref(false);
const isSubmitting = ref(false);
const submitError = ref(null);
const newDiscussion = ref({
    title: '',
    topic_id: null,
    content: '',
    visibility: 'public',
});

const fetchPosts = async () => {
    isPostsLoading.value = true;
    postsError.value = null;
    const [sortField, sortDirection] = sortBy.value.split('-');

    try {
        const params = new URLSearchParams({
            page: currentPage.value,
            per_page: postsPerPage.value,
            search: searchQuery.value,
            status: status.value,
            sort_by: sortField,
            sort_dir: sortDirection,
        });

        if (selectedTopicId.value) {
            params.append('topic_id', selectedTopicId.value);
        }

        if (activeFilter.value === 'mine') {
            params.append('filter', 'my_posts');
            params.delete('status');
        }

        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get('/api/posts', { params, headers });

        if (response.data && response.data.data) {
            posts.value = response.data.data;
            totalPages.value = response.data.meta.last_page;
            currentPage.value = response.data.meta.current_page;
        } else {
            throw new Error("Cấu trúc dữ liệu bài viết từ API không hợp lệ.");
        }
    } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
        postsError.value = "Không thể tải danh sách bài viết. Vui lòng thử lại sau.";
    } finally {
        isPostsLoading.value = false;
    }
};

const fetchTopics = async () => {
    isTopicsLoading.value = true;
    topicsError.value = null;
    try {
        const response = await axios.get('/api/topics');
        if (response.data && response.data.data) {
            topics.value = response.data.data;
        } else {
            throw new Error("Cấu trúc dữ liệu topics từ API không hợp lệ.");
        }
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        topicsError.value = "Không thể tải danh sách danh mục.";
    } finally {
        isTopicsLoading.value = false;
    }
};

const creatableTopics = computed(() => {
    if (!currentUser.value || isTopicsLoading.value) {
        return [];
    }

    if (currentUser.value.role === 'admin') {
        return topics.value;
    }

    const allowedSlugs = ['thao-luan-chung', 'bao-loi-gop-y'];
    return topics.value.filter(topic => allowedSlugs.includes(topic.slug));
});

const startDiscussion = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        isAuthModalVisible.value = true;
        return;
    }
    if (!newDiscussion.value.title || !newDiscussion.value.content || !newDiscussion.value.topic_id) {
        submitError.value = "Vui lòng điền đầy đủ tiêu đề, nội dung và chọn chủ đề.";
        return;
    }
    isSubmitting.value = true;
    submitError.value = null;
    try {
        const payload = {
            title: newDiscussion.value.title,
            content: newDiscussion.value.content,
            topic_id: newDiscussion.value.topic_id,
            status: newDiscussion.value.visibility,
        };
        await axios.post('/api/posts', payload, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        closeCreateForm();
        if (currentPage.value !== 1) {
            currentPage.value = 1;
        } else {
            fetchPosts();
        }
    } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
        if (error.response && error.response.data && error.response.data.errors) {
            if (error.response.data.errors.title) {
                submitError.value = error.response.data.errors.title[0];
            }
            else {
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                submitError.value = error.response.data.errors[firstErrorKey][0];
            }
        } else {
            submitError.value = "Đã có lỗi xảy ra khi tạo bài viết.";
        }
    } finally {
        isSubmitting.value = false;
    }
};

const isLoggedIn = computed(() => {
    return !!currentUser.value;
});

const setFilter = (filter) => {
    const token = localStorage.getItem('token');
    if (filter === 'mine' && !token) {
        isAuthModalVisible.value = true;
        return;
    }
    activeFilter.value = filter;
    selectedTopicId.value = null;
    currentPage.value = 1;
    fetchPosts();
};

const isMarkdownPreview = ref(false);

const openCreateForm = () => {
    if (!isLoggedIn.value) {
        isAuthModalVisible.value = true;
        return;
    }
    showCreateForm.value = true;
};

const closeCreateForm = () => {
    showCreateForm.value = false;
    isMarkdownPreview.value = false;
    submitError.value = null;
    newDiscussion.value = { title: '', topic_id: null, content: '', visibility: 'public' };
};

const handleTopicSelect = (topicId) => {
    selectedTopicId.value = selectedTopicId.value === topicId ? null : topicId;
};

watch(activeFilter, () => {
});

watch([() => searchQuery.value, sortBy, selectedTopicId], () => {
    if (currentPage.value !== 1) {
        currentPage.value = 1;
    } else {
        fetchPosts();
    }
}, { deep: true });

watch(currentPage, (newPage, oldPage) => {
    if (newPage !== oldPage) {
        fetchPosts();
    }
});

onMounted(() => {
    const userJson = localStorage.getItem('user');

    if (userJson) {
        try {
            currentUser.value = JSON.parse(userJson);
        } catch (e) {
            console.error("Lỗi khi parse dữ liệu user:", e);
        }
    }

    fetchTopics();
    fetchPosts();
});
</script>

<template>
    <AuthenticatedLayout>
        <div class="flex flex-col">
            <main class="flex-grow">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div class="grid grid-cols-12 gap-8 py-12">

                        <!-- Sidebar trái -->
                        <aside class="col-span-12 lg:col-span-3">
                            <div class="top-24 space-y-6">
                                <PrimaryButton @click="openCreateForm" class="w-full">Tạo Bài Viết</PrimaryButton>

                                <div class="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow dark:shadow-none border border-gray-100 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Bài Viết</h3>
                                    <ul class="space-y-1 text-sm font-medium">
                                        <li>
                                            <button @click="setFilter('all')" :class="['w-full text-left px-3 py-2 rounded-md transition', activeFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50']">
                                                Tất cả bài viết
                                            </button>
                                        </li>
                                        <li v-if="isLoggedIn">
                                            <button @click="setFilter('mine')" :class="['w-full text-left px-3 py-2 rounded-md transition', activeFilter === 'mine' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50']">
                                                Bài viết của tôi
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <div class="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow dark:shadow-none border border-gray-100 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Danh Mục</h3>
                                    <LoadingSpinner v-if="isTopicsLoading" text="Đang tải..." class="p-4" />
                                    <div v-else-if="topicsError" class="text-red-500 dark:text-red-400 text-sm p-4">{{ topicsError }}</div>
                                    <ul v-else class="space-y-1 text-sm font-medium">
                                        <li>
                                            <button @click="handleTopicSelect(null)" :class="['w-full text-left px-3 py-2 rounded-md transition', selectedTopicId === null ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50']">
                                                Tất Cả
                                            </button>
                                        </li>
                                        <li v-for="topic in topics" :key="topic.id">
                                            <button @click="handleTopicSelect(topic.id)" :class="['w-full text-left px-3 py-2 rounded-md transition', selectedTopicId === topic.id ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50']">
                                                {{ topic.title }}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </aside>

                        <!-- Nội dung chính -->
                        <div class="col-span-12 lg:col-span-9">
                            <!-- Thanh lọc -->
                            <div class="flex-shrink-0 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row items-center p-2 gap-4 mb-6">
                                <div class="relative w-full sm:w-auto flex-grow">
                                    <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                                    <input v-model.lazy="searchQuery" type="search" placeholder="Tìm kiếm theo tiêu đề..." class="w-full bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition pl-10 text-gray-900 dark:text-gray-200 placeholder-gray-400">
                                </div>
                                <div class="w-full sm:w-auto">
                                    <select v-model="sortBy" class="w-full bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-gray-200">
                                        <option value="created_at-desc">Mới nhất</option>
                                        <option value="created_at-asc">Cũ nhất</option>
                                        <option value="likes_count-desc">Nhiều lượt thích</option>
                                        <option value="comments_count-desc">Nhiều bình luận</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Wrapper danh sách -->
                            <div class="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg shadow dark:shadow-none">
                                <LoadingSpinner v-if="isPostsLoading" text="Đang tải bài viết..." padding="py-20" />
                                <div v-else-if="postsError" class="flex items-center justify-center h-48 text-red-500 dark:text-red-400">{{ postsError }}</div>
                                <div v-else>
                                    <ul v-if="posts.length > 0">
                                        <li v-for="post in posts" :key="post.id" class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            <img :src="`https://ui-avatars.com/api/?name=${post.author.username.charAt(0)}&background=random&color=fff`" class="w-10 h-10 rounded-full flex-shrink-0">
                                            <div class="ml-4 flex-grow min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <!-- Tag đã có màu ổn, không cần sửa nhiều -->
                                                    <span v-if="post.status === 'public'" class="flex-shrink-0 inline-flex items-center justify-center min-w-[90px] px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300" title="Bài viết này hiển thị công khai">
                                                        <GlobeAltIcon class="w-3.5 h-3.5 mr-1"/> Công khai
                                                    </span>
                                                    <span v-if="post.status === 'private'" class="flex-shrink-0 inline-flex items-center justify-center min-w-[90px] px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300" title="Bài viết này chỉ mình bạn thấy">
                                                        <LockClosedIcon class="w-3.5 h-3.5 mr-1"/> Riêng tư
                                                    </span>
                                                    <Link :href="`/posts/${post.slug}`" class="font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate min-w-0">{{ post.title }}</Link>
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <span>{{ post.author.username }}</span> • <span>{{ new Date(post.created_at).toLocaleDateString() }}</span> • <span>{{ post.topic.title }}</span>
                                                </div>
                                            </div>
                                            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0 gap-4">
                                                <span class="flex items-center" title="Likes"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path></svg>{{ post.likes_count }}</span>
                                                <span class="flex items-center" title="Comments"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.033.91 3.862 2.38 5.148l-.824 2.47a.5.5 0 00.64.64l2.47-.823A7.96 7.96 0 0010 17c4.418 0 8-3.134 8-7s-3.582-7-8-7z" clip-rule="evenodd"></path></svg>{{ post.comments_count }}</span>
                                            </div>
                                        </li>
                                    </ul>
                                    <div v-else class="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                                        Không tìm thấy bài viết nào phù hợp.
                                    </div>
                                </div>

                                <Pagination v-model:currentPage="currentPage" :total-pages="totalPages" :is-loading="isPostsLoading" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Create Discussion Form Overlay -->
        <Transition name="slide-up">
            <div v-if="showCreateForm" class="fixed inset-0 z-30 flex flex-col justify-end" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <!-- Backdrop -->
                <div @click="closeCreateForm" class="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity"></div>

                <!-- Form Panel -->
                <div class="relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl w-full" style="height: 55vh;">
                    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 h-full flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <h2 id="modal-title" class="text-xl font-bold text-gray-900 dark:text-white">Bài Viết Mới</h2>
                            <button @click="closeCreateForm" class="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition" aria-label="Đóng">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div class="flex-grow flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
                            <!-- Title & Topic -->
                            <div class="flex flex-col sm:flex-row gap-4">
                                <input v-model="newDiscussion.title" type="text" placeholder="Tiêu đề bài viết..." class="flex-grow bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500">
                                <select v-model="newDiscussion.topic_id" class="sm:w-1/4 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white">
                                    <option :value="null" disabled>Chọn chủ đề</option>
                                    <option v-for="topic in creatableTopics" :key="topic.id" :value="topic.id">
                                        {{ topic.title }}
                                    </option>
                                </select>
                            </div>

                            <!-- Content Editor -->
                            <MarkdownEditor v-model="newDiscussion.content" />
                        </div>
                        <!-- Action Buttons -->
                        <div class="flex-shrink-0 pt-4">
                            <!-- Hiển thị lỗi nếu có -->
                            <p v-if="submitError" class="text-center text-red-500 dark:text-red-400 text-sm mb-3">{{ submitError }}</p>

                            <div class="flex items-center justify-between">
                                <!-- Chuyển đổi Công khai/Riêng tư -->
                                <div class="flex items-center rounded-lg p-1 bg-gray-100 dark:bg-gray-900">
                                    <button @click="newDiscussion.visibility = 'public'" :class="['px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition', newDiscussion.visibility === 'public' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700']">
                                        <GlobeAltIcon class="w-5 h-5"/> Công khai
                                    </button>
                                    <button @click="newDiscussion.visibility = 'private'" :class="['px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition', newDiscussion.visibility === 'private' ? 'bg-yellow-500 text-white dark:bg-yellow-600' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700']">
                                        <LockClosedIcon class="w-5 h-5"/> Riêng tư
                                    </button>
                                </div>

                                <!-- Nút Gửi đã được cập nhật -->
                                <PrimaryButton
                                    @click="startDiscussion"
                                    :loading="isSubmitting"
                                >
                                    Tạo Bài Viết
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <AuthRequiredModal
            :show="isAuthModalVisible"
            @close="isAuthModalVisible = false"
            title="Yêu cầu Đăng nhập"
            message="Vui lòng đăng nhập để có thể tạo bài viết mới."
        />

    </AuthenticatedLayout>
</template>

<style>
/* Transition cho form */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s ease-in-out; }
.slide-up-enter-active .relative, .slide-up-leave-active .relative { transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1); }
.slide-up-enter-from .relative, .slide-up-leave-to .relative { transform: translateY(100%); }
.slide-up-enter-from .fixed.inset-0, .slide-up-leave-to .fixed.inset-0 { opacity: 0; }

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 10px; border: 2px solid #2d3748; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #718096; }
</style>
