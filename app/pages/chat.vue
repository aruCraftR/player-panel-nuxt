<!-- pages/chat.vue -->
<script setup lang="ts">
definePageMeta({ title: '服务器聊天 占位页面' })

const message = ref('')
const messages = ref([
    { id: 1, user: 'System', text: 'Welcome to aruCraftR chat!', time: '10:00', type: 'system' },
    { id: 2, user: 'Alex', text: 'Hello everyone!', time: '10:01', type: 'user' },
    { id: 3, user: 'Steve', text: 'Anyone wanna trade?', time: '10:05', type: 'user' }
])

const sendMessage = () => {
    if (!message.value.trim()) return
    messages.value.push({
        id: Date.now(),
        user: 'Me',
        text: message.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'self'
    })
    message.value = ''
    // TODO: Implement actual WebSocket or API call
}
</script>

<template>
    <div class="flex flex-col h-[calc(100vh-8rem)]">
        <!-- 聊天记录区域 -->
        <div
            class="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-4">
            <div v-for="msg in messages" :key="msg.id" class="flex flex-col"
                :class="msg.type === 'self' ? 'items-end' : 'items-start'">
                <div class="text-xs text-gray-500 mb-1 px-1">
                    <span v-if="msg.type !== 'self'" class="font-bold mr-1">{{ msg.user }}</span>
                    <span>{{ msg.time }}</span>
                </div>
                <div class="px-4 py-2 rounded-2xl max-w-[80%]" :class="[
                    msg.type === 'self' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-700 rounded-tl-sm shadow-sm',
                    msg.type === 'system' ? 'bg-gray-200 dark:bg-gray-600 text-xs italic w-full text-center rounded-lg' : ''
                ]">
                    {{ msg.text }}
                </div>
            </div>
        </div>

        <!-- 输入框 -->
        <div class="flex gap-2">
            <UInput v-model="message" placeholder="输入消息..." class="flex-1" @keyup.enter="sendMessage">
                <template #trailing>
                    <UIcon name="i-heroicons-paper-airplane" class="cursor-pointer text-primary-500"
                        @click="sendMessage" />
                </template>
            </UInput>
        </div>
    </div>
</template>