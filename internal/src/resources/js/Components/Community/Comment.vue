<script setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import { HeartIcon } from '@heroicons/vue/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid';

const props = defineProps({
    comment: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['reply', 'require-auth']);

const isLikingComment = ref(false);

const repliesToShow = ref(2);
const areAllRepliesShown = computed(() => {
    return !props.comment.replies || repliesToShow.value >= props.comment.replies.length;
});

const visibleReplies = computed(() => {
    return props.comment.replies ? props.comment.replies.slice(0, repliesToShow.value) : [];
});

const showMoreReplies = () => {
    repliesToShow.value = Math.min(repliesToShow.value + 5, props.comment.replies.length);
};

const toggleCommentLike = async (commentToLike) => {
    const token = localStorage.getItem('token');
    if (!token) {
        emit('require-auth', 'Bạn cần đăng nhập để thích bình luận này.');
        return;
    }

    if (isLikingComment.value) return;
    isLikingComment.value = true;

    const originalIsLiked = commentToLike.is_liked;
    const originalLikesCount = commentToLike.likes_count;

    if (commentToLike.is_liked) {
        commentToLike.likes_count--;
        commentToLike.is_liked = false;
    } else {
        commentToLike.likes_count++;
        commentToLike.is_liked = true;
    }

    try {
        const response = await axios.post(`/api/comments/${commentToLike.id}/like`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        commentToLike.is_liked = response.data.data.is_liked;
        commentToLike.likes_count = response.data.data.likes_count;
    } catch (e) {
        console.error("Lỗi khi like bình luận:", e);
        commentToLike.is_liked = originalIsLiked;
        commentToLike.likes_count = originalLikesCount;
        alert('Đã xảy ra lỗi khi thích bình luận này.');
    } finally {
        isLikingComment.value = false;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const authorAvatarUrl = computed(() => {
    return props.comment.author.avatar || `https://ui-avatars.com/api/?name=${props.comment.author.username.charAt(0)}&background=random&color=fff`;
});
</script>

<template>
    <div class="flex items-start space-x-4">
        <img :src="authorAvatarUrl" class="w-10 h-10 rounded-full flex-shrink-0" alt="Avatar">
        <div class="flex-grow min-w-0">
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p class="font-semibold text-gray-800 dark:text-gray-200">{{ comment.author.username }}</p>
                <p class="text-gray-700 dark:text-gray-300 mt-1 break-words whitespace-pre-wrap">{{ comment.content }}</p>
            </div>
            <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2 pl-1">
                <span>{{ formatDate(comment.created_at) }}</span>

                <button
                    @click="toggleCommentLike(comment)"
                    :disabled="isLikingComment"
                    class="flex items-center space-x-1 font-semibold transition-colors disabled:opacity-50"
                    :class="comment.is_liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'"
                >
                    <HeartIconSolid v-if="comment.is_liked" class="w-4 h-4" />
                    <HeartIcon v-else class="w-4 h-4" />
                    <span>{{ comment.likes_count }}</span>
                </button>

                <button @click="emit('reply', comment)" class="font-semibold hover:underline">Trả lời</button>
            </div>

            <!-- PHẦN ĐỆ QUY -->
            <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Comment
                    v-for="reply in visibleReplies"
                    :key="reply.id"
                    :comment="reply"
                    @reply="(replyTo) => emit('reply', replyTo)"
                    @require-auth="(message) => emit('require-auth', message)"
                />

                <!-- NÚT "XEM THÊM" -->
                <button v-if="!areAllRepliesShown"
                        @click="showMoreReplies"
                        class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Xem thêm {{ comment.replies.length - repliesToShow }} trả lời
                </button>
            </div>
        </div>
    </div>
</template>
