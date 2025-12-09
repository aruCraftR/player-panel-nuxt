<!-- pages/index.vue -->
<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';
import type { ApiResponse, ServerInfo } from '~/types/api';

definePageMeta({ title: '服务器列表' })

const { serverList, lastFetchServerListTimestamp, isServerListLoaded } = useUi()
const { user } = useAuth()
const toast = useToast()
type Colors = "neutral" | "primary" | "secondary" | "success" | "info" | "warning" | "error"
const statusColors: Map<string, Colors> = new Map([
    ['active', 'success'],
    ['starting', 'primary'],
    ['stopping', 'warning'],
    ['stopped', 'error'],
    ['unresponsive', 'warning'],
    ['unstarted', 'neutral']
])
const statusText: Map<string, string> = new Map([
    ['active', '运行中'],
    ['starting', '启动中'],
    ['stopping', '关闭中'],
    ['stopped', '已关闭'],
    ['unresponsive', '无响应'],
    ['unstarted', '未启动']
])
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

// @ts-expect-error ts认不出来扩展运算符内的类型
const getCardMenuItems = (server: ServerInfo): ContextMenuItem[] => [
    {
        label: '查看详细信息',
        icon: 'i-heroicons-information-circle',
        onSelect() {
            console.log(server)
        }
    },
    {
        label: '进入聊天',
        icon: 'i-heroicons-chat-bubble-oval-left-ellipsis',
        onSelect() {
            toast.add({ title: '聊天功能正在开发中', color: 'neutral' })
        }
    },
    ...(user.value && user.value.permission >= 5 ? [
        { type: 'separator' },
        {
            label: '管理员',
            color: 'primary',
            icon: 'i-heroicons-shield-check',
            children: [
                [
                    {
                        label: '修改属性',
                        color: 'warning',
                        icon: 'i-lucide-pencil',
                        onSelect() {
                            console.log(server)
                        }
                    },
                    {
                        label: '删除',
                        color: 'error',
                        icon: 'i-lucide-trash',
                        onSelect() {

                        }
                    }
                ]
            ]
        }
    ] : []
    )
].filter(Boolean)


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
    <div v-else-if="serverList.length > 0" class="space-y-5">
        <UBanner title="点击对应卡片可查看玩家列表" icon="i-lucide-info" class="rounded-xl" color="primary" />
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <UContextMenu v-for="server in serverList" :key="server.id" :items="getCardMenuItems(server)">
                <UCard class="hover:shadow-lg transition-shadow duration-300 p-0">
                    <div class="p-4">
                        <UPopover arrow mode="click">
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
                                <UBadge class="h-min" :color="statusColors.get(server.status) || 'neutral'"
                                    variant="solid">
                                    {{ statusText.get(server.status) || '状态未知' }}
                                </UBadge>
                            </div>
                            <template #content>
                                <div v-if="server.players.length > 0" class="p-3 grid grid-cols-2 gap-2">
                                    <UUser v-for="player in server.players" :key="player.player_id"
                                        :name="player?.player_id" :avatar="{
                                            src: `http://q1.qlogo.cn/g?b=qq&nk=${player.qq_id || 0}&s=140`
                                        }" alt="Avatar" size="sm" />
                                    <!-- MC头像: `https://avatars.cloudhaven.gg/avatars/${player?.uuid || '853c80ef3c3749fdaa49938b674adae6'}` -->
                                </div>
                                <div v-else class="p-3">
                                    没有玩家呢
                                </div>
                            </template>
                        </UPopover>

                        <UProgress size="xs" :color="statusColors.get(server.status) || 'neutral'" />

                        <div class="mt-4 flex gap-2">
                            <UButton block variant="soft" :disabled="server.status !== 'active'"
                                @click="toast.add({ title: '聊天功能正在开发中', color: 'neutral' })">进入聊天</UButton>
                        </div>
                    </div>
                </UCard>
            </UContextMenu>
            <UCard v-if="user && user.permission >= 5" class="hover:scale-105 transition-scale duration-200 p-0">
                <div class="my-10">
                    <UIcon name="i-heroicons-squares-plus" class="size-10 justify-center w-full text-neutral-500" />
                    <p class="w-full text-center text-neutral-500">添加服务器</p>
                </div>
            </UCard>
        </div>
    </div>
    <UPageHero v-else-if="serverList.length == 0" headline="啊嘞?" title="没有服务器在线" description="或许有什么特殊状况?" />
</template>