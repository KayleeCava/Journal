<script setup>
import { ref, onMounted } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import LoadingSpinner from "@/Components/LoadingSpinner.vue";
import PrimaryButton from "@/Components/PrimaryButton.vue";
import Comment from '@/Components/Community/Comment.vue';
import AuthRequiredModal from '@/Components/AuthRequiredModal.vue';
import PermissionDeniedModal from '@/Components/PermissionDeniedModal.vue';
import axios from 'axios';
import {
    HeartIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ShareIcon,
    BookmarkIcon,
    GlobeAltIcon,
    LockClosedIcon
} from '@heroicons/vue/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid';

const props = defineProps({
    slug: {
        type: String,
        required: true,
    }
});

const post = ref(null);
const relatedPosts = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isLiking = ref(false);

const showAuthModal = ref(false);
const authModalMessage = ref('')
const showPermissionModal = ref(false);

const newCommentContent = ref('');
const isSubmittingComment = ref(false);
const commentError = ref(null);
const replyingTo = ref(null);

const fetchPostDetail = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const response = await axios.get(`/api/posts/${props.slug}`, { headers });
        post.value = response.data.data;
        relatedPosts.value = response.data.meta.related_posts;

    } catch (e) {
        console.error("Lỗi khi tải chi tiết bài viết:", e);
        if (e.response) {
            if (e.response.status === 403) {
                showPermissionModal.value = true;
            } else if (e.response.status === 404) {
                error.value = "Bài viết bạn tìm không tồn tại.";
            } else {
                error.value = "Đã có lỗi xảy ra, không thể tải bài viết.";
            }
        } else {
            error.value = "Lỗi mạng hoặc không thể kết nối đến máy chủ.";
        }
    } finally {
        isLoading.value = false;
    }
};

const submitComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        triggerAuthModal('Bạn cần đăng nhập để gửi bình luận.');
        return;
    }
    if (!newCommentContent.value.trim()) return;

    isSubmittingComment.value = true;
    commentError.value = null;

    try {
        const payload = {
            content: newCommentContent.value,
        };
        if (replyingTo.value) {
            payload.parent_id = replyingTo.value.id;
        }

        const response = await axios.post(`/api/posts/${post.value.id}/comments`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        fetchPostDetail();

        newCommentContent.value = '';
        replyingTo.value = null;

    } catch (e) {
        console.error("Lỗi khi gửi bình luận:", e);
        commentError.value = "Không thể gửi bình luận. Vui lòng thử lại.";
    } finally {
        isSubmittingComment.value = false;
    }
};

const startReply = (comment) => {
    replyingTo.value = comment;
    // Tùy chọn: Focus vào textarea
    document.getElementById('comment-textarea').focus();
};

const triggerAuthModal = (message) => {
    authModalMessage.value = message;
    showAuthModal.value = true;
};

const handleAuthModalClose = () => {
    showAuthModal.value = false;
};

onMounted(() => {
    fetchPostDetail();
});

const toggleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        triggerAuthModal('Bạn cần đăng nhập để thích bài viết.');
        return;
    }

    if (isLiking.value) return;
    isLiking.value = true;

    const originalIsLiked = post.value.is_liked;
    const originalLikesCount = post.value.likes_count;

    if (post.value.is_liked) {
        post.value.likes_count--;
        post.value.is_liked = false;
    } else {
        post.value.likes_count++;
        post.value.is_liked = true;
    }

    try {
        const response = await axios.post(`/api/posts/${post.value.id}/like`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        post.value.is_liked = response.data.data.is_liked;
        post.value.likes_count = response.data.data.likes_count;

    } catch (e) {
        console.error("Lỗi khi like bài viết:", e);
        post.value.is_liked = originalIsLiked;
        post.value.likes_count = originalLikesCount;
    } finally {
        isLiking.value = false;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};
</script>

<template>
    <AuthenticatedLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <!-- 1. Hiển thị Loading Spinner ở cấp cao nhất -->
            <div v-if="isLoading" class="flex justify-center items-center h-96">
                <LoadingSpinner text="Đang tải bài viết..." />
            </div>

            <!-- 2. Hiển thị Lỗi ở cấp cao nhất -->
            <div v-else-if="error" class="flex justify-center items-center h-96">
                <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-6 py-8 rounded-lg text-center max-w-lg">
                    <h3 class="font-bold text-lg">Đã xảy ra lỗi</h3>
                    <p class="mt-2">{{ error }}</p>
                </div>
            </div>


            <div v-else-if="post" class="grid grid-cols-12 gap-8">
                <!-- Nội dung chính -->
                <div class="col-span-12 lg:col-span-8">
                    <div class="space-y-8">
                        <!-- Bài viết -->
                        <article class="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-6 md:p-8">
                            <!-- Header bài viết -->
                            <header class="mb-6">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">{{ post.topic.title }}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(post.created_at) }}</span>
                                </div>
                                <div class="flex items-start gap-3">
                                    <!-- ICON TRẠNG THÁI -->
                                    <span v-if="post.status === 'public'" class="mt-2 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300" title="Bài viết này hiển thị công khai">
                                        <GlobeAltIcon class="w-4 h-4 mr-1.5"/> Công khai
                                    </span>
                                    <span v-if="post.status === 'private'" class="mt-2 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300" title="Bài viết này chỉ mình bạn thấy">
                                        <LockClosedIcon class="w-4 h-4 mr-1.5"/> Riêng tư
                                    </span>

                                    <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                                        {{ post.title }}
                                    </h1>
                                </div>
                                <div class="flex items-center space-x-3 text-sm mt-6">
                                    <img :src="post.author.avatar" class="w-10 h-10 rounded-full" alt="Avatar">
                                    <div>
                                        <p class="font-bold text-gray-800 dark:text-gray-200">{{ post.author.username }}</p>
                                        <p class="text-gray-500 dark:text-gray-400">Tác giả</p>
                                    </div>
                                </div>
                            </header>

                            <!-- Nội dung bài viết -->
                            <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" v-html="post.content"></div>

                            <!-- Thanh tương tác -->
                            <footer class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <button
                                        @click="toggleLike"
                                        :disabled="isLiking"
                                        class="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors disabled:opacity-50 disabled:hover:text-gray-500"
                                    >
                                        <!-- Sử dụng post.is_liked thay vì isLiked -->
                                        <HeartIconSolid v-if="post.is_liked" class="w-6 h-6 text-red-500" />
                                        <HeartIcon v-else class="w-6 h-6" />
                                        <span class="font-semibold text-sm">{{ post.likes_count }}</span>
                                    </button>
                                    <a href="#comments" class="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        <ChatBubbleOvalLeftEllipsisIcon class="w-6 h-6"/>
                                        <span class="font-semibold text-sm">{{ post.comments_count }} Bình luận</span>
                                    </a>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <BookmarkIcon class="w-5 h-5"/>
                                    </button>
                                    <button class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <ShareIcon class="w-5 h-5"/>
                                    </button>
                                </div>
                            </footer>
                        </article>

                        <!-- Phần bình luận -->
                        <section id="comments" class="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-6 md:p-8">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{{ post.comments_count }} Bình luận</h2>

                            <!-- Form bình luận mới -->
                            <div class="flex items-start space-x-4 mb-8">
                                <img src="https://ui-avatars.com/api/?name=Me&background=random&color=fff" class="w-10 h-10 rounded-full flex-shrink-0 mt-1" alt="Your Avatar">
                                <div class="flex-grow">
                                    <div v-if="replyingTo" class="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-t-md text-gray-600 dark:text-gray-300">
                                        Đang trả lời <strong>{{ replyingTo.author.username }}</strong>
                                        <button @click="replyingTo = null" class="font-bold ml-2 text-red-500">&times;</button>
                                    </div>

                                    <textarea
                                        id="comment-textarea"
                                        v-model="newCommentContent"
                                        class="w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-gray-200 placeholder-gray-400"
                                        :class="{ 'rounded-t-none': replyingTo }"
                                        rows="3"
                                        placeholder="Viết bình luận của bạn..."
                                    ></textarea>

                                    <p v-if="commentError" class="text-xs text-red-500 mt-1">{{ commentError }}</p>

                                    <div class="text-right mt-2">
                                        <PrimaryButton
                                            @click="submitComment"
                                            :loading="isSubmittingComment"
                                            :disabled="!newCommentContent.trim()"
                                        >
                                            Gửi
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>

                            <!-- Danh sách bình luận -->
                            <div v-if="post.comments && post.comments.length > 0" class="space-y-6">
                                <Comment
                                    v-for="comment in post.comments"
                                    :key="comment.id"
                                    :comment="comment"
                                    @reply="startReply"
                                    @require-auth="triggerAuthModal"
                                />
                            </div>
                            <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </div>
                        </section>
                    </div>
                </div>

                <!-- Sidebar phải -->
                <aside class="col-span-12 lg:col-span-4">
                    <div class="sticky top-24 space-y-6">
                        <!-- Thẻ tác giả -->
                        <div class="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-6 text-center">
                            <img :src="post.author.avatar" class="w-20 h-20 rounded-full mx-auto mb-4" alt="Author Avatar">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ post.author.username }}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ post.author.bio }}</p>
                            <PrimaryButton class="mt-4 w-full">Theo Dõi</PrimaryButton>
                        </div>
                        <!-- Thẻ bài viết liên quan -->
                        <div v-if="relatedPosts.length > 0" class="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-6">
                            <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Bài Viết Liên Quan</h3>
                            <ul class="space-y-3">
                                <li v-for="related in relatedPosts" :key="related.id">
                                    <a :href="`/posts/${related.slug}`" class="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ related.title }}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>

            <AuthRequiredModal
                :show="showAuthModal"
                title="Yêu cầu đăng nhập"
                :message="authModalMessage"
                @close="handleAuthModalClose"
            />

            <PermissionDeniedModal :show="showPermissionModal" />
        </div>
    </AuthenticatedLayout>
</template>

<style>
.prose {
    line-height: 1.7;
}
.prose a {
    @apply text-indigo-600 dark:text-indigo-400 no-underline hover:underline;
}
.prose strong {
    @apply text-gray-800 dark:text-gray-200;
}
.prose ul > li::before {
    @apply bg-gray-400 dark:bg-gray-500;
}
.prose pre {
    @apply bg-gray-900 text-white rounded-lg p-4 text-sm;
}
.prose code {
    @apply font-mono text-sm;
}
.prose code:not(pre > code) {
    @apply bg-gray-100 dark:bg-gray-700 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded;
}
</style>
