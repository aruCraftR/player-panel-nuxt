<!-- pages/index.vue -->
<script setup lang="ts">
import type { ApiResponse, ServerInfo } from '~/types/api'


definePageMeta({ title: '服务器列表' })

const { serverList, lastFetchServerListTimestamp, isServerListLoaded } = useUi()
const { checkServerProfiles, serverProfiles } = useData()
const { user } = useAuth()
const { usePanelApi } = useApi()
const { useServerProfileEditor } = useEditor()
let isPageActivated = false;
let timer: number;


const updateServers = async () => {
    if (!isPageActivated) return
    const now = Date.now()
    if (now - lastFetchServerListTimestamp.value <= 5) return
    lastFetchServerListTimestamp.value = now
    try {
        const response: ApiResponse<ServerInfo[]> = await usePanelApi('get', '/server/list')
        if (response.data !== null) {
            serverList.value = await checkServerProfiles(response.data)
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


const createServerProfile = async () => {
    if (!user.value || user.value.permission < 5) return
    await useServerProfileEditor()
}

</script>

<template>
    <UPageHero v-if="!isServerListLoaded" headline="稍安勿躁哦" title="正在获取服务器列表" description="CloudFlare在国内的访问速度可能偏慢" />
    <div v-else-if="serverList.length > 0" class="space-y-5">
        <UBanner title="点击对应卡片可查看玩家列表" icon="i-lucide-info" class="rounded-xl" color="primary" />
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ServerInfoCard v-for="server in serverList" :key="server.id" :server-info="server"
                :server-profile="serverProfiles[server.id]!" />
            <UCard v-if="user && user.permission >= 5" class="hover:scale-105 transition-scale duration-200 p-0"
                @click="createServerProfile()">
                <div class="my-10">
                    <UIcon name="i-heroicons-squares-plus" class="size-10 justify-center w-full text-neutral-500" />
                    <p class="w-full text-center text-neutral-500">添加服务器</p>
                </div>
            </UCard>
        </div>
    </div>
    <UPageHero v-else-if="serverList.length == 0" headline="啊嘞?" title="没有服务器在线" description="或许有什么特殊状况?"
        @click="createServerProfile" />

</template>