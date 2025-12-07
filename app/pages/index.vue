<!-- pages/index.vue -->
<script setup lang="ts">
import type { ApiResponse, ServerInfo } from '~/types/api';

definePageMeta({ title: '服务器列表' })

const { serverList, lastFetchServerListTimestamp, isServerListLoaded } = useUi()
type Colors = "neutral" | "primary" | "secondary" | "success" | "info" | "warning" | "error"
const statusColors: Map<string, Colors> = new Map([
    ['active', 'success'],
    ['starting', 'neutral'],
    ['stopping', 'warning'],
    ['stopped', 'error'],
    ['unresponsive', 'warning']]
)
const statusText: Map<string, string> = new Map([
    ['active', '运行中'],
    ['starting', '启动中'],
    ['stopping', '关闭中'],
    ['stopped', '已关闭'],
    ['unresponsive', '无响应']]
)
let isPageActivated = false;
let timer: number;

const updateServers = async () => {
    if (!isPageActivated) return
    const now = Date.now()
    if (now - lastFetchServerListTimestamp.value <= 5) return
    lastFetchServerListTimestamp.value = now
    try {
        const response: ApiResponse<ServerInfo[]> = await useApi('get', '/server/list')
        if (response.data !== null) {
            serverList.value = response.data
            isServerListLoaded.value = true
        }
    } finally {
        if (isPageActivated) {
            timer = setTimeout(updateServers, 20000);
        }
    }
}


onMounted(() => {
    isPageActivated = true
    updateServers()
})

onUnmounted(() => {
    isPageActivated = false
    clearTimeout(timer)
})

</script>

<template>
    <UPageHero v-if="!isServerListLoaded" headline="稍安勿躁哦" title="正在获取服务器列表" description="CloudFlare在国内的访问速度可能偏慢" />
    <div v-else-if="serverList.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <UCard v-for="server in serverList" :key="server.id" class="hover:shadow-lg transition-shadow duration-300 p-0">

            <div class="p-4">
                <UPopover arrow mode="hover" :open-delay=300>
                    <div class="flex cursor-pointer">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold mb-2">{{ server.id }}</h3>

                            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-users" />
                                    <span>{{ server.player_count }} / {{ server.max_players }}</span>
                                </div>
                            </div>
                        </div>
                        <UBadge class="h-min" :color="statusColors.get(server.status) || 'neutral'" variant="solid">
                            {{ statusText.get(server.status) || '状态未知' }}
                        </UBadge>
                    </div>
                    <template #content>
                        <div v-if="server.players.length > 0" class="p-3 grid grid-cols-2 gap-2">
                            <UUser v-for="player in server.players" :key="player.player_id" :name="player?.player_id"
                                :avatar="{
                                    src: `https://avatars.cloudhaven.gg/avatars/${player?.uuid || '853c80ef3c3749fdaa49938b674adae6'}`
                                }" alt="Avatar" size="sm" />
                        </div>
                        <div v-else class="p-3">
                            没有玩家呢
                        </div>
                    </template>
                </UPopover>

                <UProgress size="xs" :color="statusColors.get(server.status) || 'neutral'" />

                <div class="mt-4 flex gap-2">
                    <UButton block variant="soft" :disabled="server.status !== 'active'">进入聊天</UButton>
                </div>
            </div>
        </UCard>
    </div>
    <UPageHero v-else-if="serverList.length == 0" headline="啊嘞?" title="没有服务器在线" description="或许有什么特殊状况?" />
</template>