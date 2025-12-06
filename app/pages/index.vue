<!-- pages/index.vue -->
<script setup lang="ts">
definePageMeta({ title: '服务器状态 占位页面' })

// 模拟数据，实际开发中替换为 useApi 请求
const servers = ref([
    { id: 1, name: 'Survival S1', status: 'online', players: 12, max: 50, ping: 24 },
    { id: 2, name: 'Creative C1', status: 'maintenance', players: 0, max: 100, ping: -1 },
    { id: 3, name: 'Lobby', status: 'online', players: 45, max: 200, ping: 18 }
])

const getStatusColor = (status: string) => {
    if (status === 'online') return 'success'
    if (status === 'maintenance') return 'warning'
    return 'error'
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <UCard v-for="server in servers" :key="server.id" class="hover:shadow-lg transition-shadow duration-300 p-0">
            <div class="relative h-32 bg-gray-200 dark:bg-gray-800">
                <!-- 可以在这里放服务器封面图 -->
                <div class="absolute inset-0 flex items-center justify-center text-gray-400">
                    <UIcon name="i-heroicons-photo" class="w-12 h-12" />
                </div>
                <div class="absolute top-4 right-4">
                    <UBadge :color="getStatusColor(server.status)" variant="solid">
                        {{ server.status.toUpperCase() }}
                    </UBadge>
                </div>
            </div>

            <div class="p-4">
                <h3 class="text-lg font-bold mb-2">{{ server.name }}</h3>

                <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div class="flex items-center gap-1">
                        <UIcon name="i-heroicons-users" />
                        <span>{{ server.players }} / {{ server.max }}</span>
                    </div>
                    <div class="flex items-center gap-1" v-if="server.ping > 0">
                        <UIcon name="i-heroicons-signal" />
                        <span>{{ server.ping }}ms</span>
                    </div>
                </div>

                <UProgress :value="(server.players / server.max) * 100" size="xs"
                    :color="getStatusColor(server.status)" />

                <div class="mt-4 flex gap-2">
                    <UButton block variant="soft" :disabled="server.status !== 'online'">进入终端</UButton>
                </div>
            </div>
        </UCard>
    </div>
</template>