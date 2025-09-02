<script setup>
import { ref, computed, watch } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});
const emit = defineEmits(['update:modelValue']);

const isPreview = ref(false);
const md = new MarkdownIt();

const renderedMarkdown = computed(() => {
    return md.render(props.modelValue);
});

const content = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const insertMarkdown = (syntax) => {
    content.value += syntax;
};
</script>

<template>
    <div class="flex-grow flex flex-col border border-gray-300 dark:border-gray-700 rounded-md">
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <button type="button" @click="insertMarkdown('**Bold text**')" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="In đậm"><strong>B</strong></button>
                <button type="button" @click="insertMarkdown('_Italic text_')" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="In nghiêng"><em>I</em></button>
                <button type="button" @click="insertMarkdown('```\ncode block\n```')" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Chèn mã">&lt;/&gt;</button>
                <button type="button" @click="insertMarkdown('> Blockquote')" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Trích dẫn">“</button>
            </div>
            <button type="button" @click="isPreview = !isPreview" class="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
                {{ isPreview ? 'Soạn thảo' : 'Xem trước' }}
            </button>
        </div>

        <!-- Textarea or Preview -->
        <div class="p-3 flex-grow bg-white dark:bg-gray-800">
            <textarea
                v-if="!isPreview"
                v-model="content"
                class="w-full h-full bg-transparent border-0 focus:ring-0 resize-none text-gray-800 dark:text-gray-300 placeholder-gray-500"
                placeholder="Nhập nội dung của bạn ở đây (hỗ trợ Markdown)..."
            ></textarea>
            <!-- Sử dụng plugin typography của TailwindCSS -->
            <div
                v-else
                class="prose dark:prose-invert max-w-none h-full overflow-y-auto"
                v-html="renderedMarkdown"
            ></div>
        </div>
    </div>
</template>
