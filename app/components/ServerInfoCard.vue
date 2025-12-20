<script setup lang="ts">
import type { ServerInfo, ServerProfile } from '~/types/api';


defineProps<{
    serverProfile: ServerProfile
    serverInfo: ServerInfo
}>()

const { user } = useAuth()
const { useServerProfileEditor } = useEditor()
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


const openServerEditor = async (server?: ServerProfile) => {
    console.log(await useServerProfileEditor(server))
}

// @ts-expect-error ts认不出来扩展运算符内的类型
const getCardMenuItems = (serverInfo: ServerInfo, serverProfile: ServerProfile): ContextMenuItem[] => [
    {
        label: '查看详细信息',
        icon: 'i-heroicons-information-circle',
        onSelect() {
            console.log(serverInfo)
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
                            openServerEditor(serverProfile)
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

</script>

<template>
    <UContextMenu :items="getCardMenuItems(serverInfo, serverProfile)">
        <UCard class="hover:shadow-lg transition-shadow duration-300 p-0">
            <div class="p-4">
                <UPopover arrow mode="click">
                    <div class="flex cursor-pointer">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold mb-2">{{ serverProfile.zh_cn_name || serverProfile.en_ww_name
                                }}</h3>

                            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-users" />
                                    <span>{{ serverInfo.player_count }} / {{ serverInfo.max_players }}</span>
                                </div>
                            </div>
                        </div>
                        <UBadge class="h-min" :color="statusColors.get(serverInfo.status) || 'neutral'" variant="solid">
                            {{ statusText.get(serverInfo.status) || '状态未知' }}
                        </UBadge>
                    </div>
                    <template #content>
                        <div v-if="serverInfo.players.length > 0" class="p-3 grid grid-cols-2 gap-2">
                            <UUser v-for="player in serverInfo.players" :key="player.player_id"
                                :name="player?.player_id" :avatar="{
                                    src: `https://q1.qlogo.cn/g?b=qq&nk=${player.qq_id || 0}&s=140`
                                }" alt="Avatar" size="sm" />
                            <!-- MC头像: `https://avatars.cloudhaven.gg/avatars/${player?.uuid || '853c80ef3c3749fdaa49938b674adae6'}` -->
                        </div>
                        <div v-else class="p-3">
                            没有玩家呢
                        </div>
                    </template>
                </UPopover>

                <UProgress size="xs" :color="statusColors.get(serverInfo.status) || 'neutral'" />

                <div class="mt-4 flex gap-2">
                    <UButton block variant="soft" :disabled="serverInfo.status !== 'active'"
                        @click="toast.add({ title: '聊天功能正在开发中', color: 'neutral' })">进入聊天</UButton>
                </div>
            </div>
        </UCard>
    </UContextMenu>
</template>
