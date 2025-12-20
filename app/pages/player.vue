<script setup lang="ts">
import * as z from 'zod'
import type { ApiResponse, PlayerProfile } from '~/types/api'
definePageMeta({ title: '玩家设置' })

const { user, userLogout } = useAuth()
const { usePanelApi } = useApi()
const toast = useToast()
const loading = ref(true)
const showOnlineSuffixPrev = ref(false)
const showOfflineSuffixPrev = ref(false)
let oldProfile: PlayerProfile | null = null

const formSchema = z.object({
    password: z.string('请填写密码').min(8, '密码必须超过8位').optional(),
    online_qq_suffix: z.string().optional(),
    offline_qq_suffix: z.string().optional(),
})
type FormSchema = z.output<typeof formSchema>

const formState = reactive<Partial<FormSchema>>({
    password: undefined,
    online_qq_suffix: '',
    offline_qq_suffix: '',
})

const saveProfile = async () => {
    loading.value = true
    if (formState.password) {
        if (formState.password.length <= 8) {
            toast.add({ title: '密码必须超过8位', color: 'warning' })
            return
        }
        try {
            const response = await usePanelApi('post', '/player/change_password', { 'password': formState.password })
            if (response.code === 200) {
                toast.add({ title: '密码已更改', color: 'success' })
                formState.password = ''
            }
        } catch {
            toast.add({ description: '密码更改失败', color: 'error' })
        }
    }
    const updatedProfile: Record<string, string> = {}
    if (formState.online_qq_suffix !== undefined && formState.online_qq_suffix != oldProfile?.online_qq_suffix) {
        updatedProfile.online_qq_suffix = formState.online_qq_suffix
        if (oldProfile) oldProfile.online_qq_suffix = formState.online_qq_suffix
    }
    if (formState.offline_qq_suffix !== undefined && formState.offline_qq_suffix != oldProfile?.offline_qq_suffix) {
        updatedProfile.offline_qq_suffix = formState.offline_qq_suffix
        if (oldProfile) oldProfile.offline_qq_suffix = formState.offline_qq_suffix
    }
    if (Object.keys(updatedProfile).length !== 0) {
        try {
            const response = await usePanelApi('post', '/player/update_profile', updatedProfile)
            if (response.code === 200) {
                toast.add({ title: '个人设置已更新', color: 'success' })
            }
        } catch {
            toast.add({ description: '个人设置更新失败', color: 'error' })
        }
    }
    loading.value = false
}

const loadProfile = async () => {
    loading.value = true
    const response: ApiResponse<PlayerProfile> = await usePanelApi('get', '/player/profile')
    if (response.code === 200) {
        oldProfile = response.data
        formState.online_qq_suffix = response.data?.online_qq_suffix
        formState.offline_qq_suffix = response.data?.offline_qq_suffix
        loading.value = false
    }
}

onMounted(() => {
    loading.value = true
    loadProfile()
})

</script>

<template>
    <div class="max-w-2xl mx-auto space-y-6">
        <UCard>
            <template #header>
                <h2 class="text-lg font-semibold">个人资料</h2>
            </template>
            <div class="space-y-6">
                <UUser :name="user?.player_id" :description="user?.uuid" :avatar="{
                    src: `https://avatars.cloudhaven.gg/avatars/${user?.uuid || '853c80ef3c3749fdaa49938b674adae6'}`
                }" size="3xl" />

                <UForm :schema="formSchema" :state="formState" class="space-y-4" :disabled="loading">
                    <div class="flex space-x-6">
                        <UFormField label="绑定QQ">
                            <UInput :model-value="user?.qq_id" disabled />
                        </UFormField>
                        <UFormField label="更改密码" name="password">
                            <UInput v-model="formState.password" placeholder="若不需要更改密码可留空" type="password" />
                        </UFormField>
                    </div>
                    <div class="flex space-x-6">
                        <UTooltip :delay-duration="0" :open="showOnlineSuffixPrev">
                            <UFormField label="在线QQ后缀" name="online_qq_suffix">
                                <UInput v-model="formState.online_qq_suffix" placeholder="| {s}在线"
                                    @pointerenter="showOnlineSuffixPrev = true"
                                    @pointerleave="showOnlineSuffixPrev = false" />
                            </UFormField>
                            <template #content>
                                {{ formState.online_qq_suffix === '' ? `${user?.player_id} | Minecraft在线` :
                                    `${user?.player_id} ${formState.online_qq_suffix?.replaceAll('{s}', 'Minecraft')}` }}
                            </template>
                        </UTooltip>
                        <UTooltip :delay-duration="0" :open="showOfflineSuffixPrev">
                            <UFormField label="离线QQ后缀" name="offline_qq_suffix">
                                <UInput v-model="formState.offline_qq_suffix" placeholder="| {s}离线"
                                    @pointerenter="showOfflineSuffixPrev = true"
                                    @pointerleave="showOfflineSuffixPrev = false" />
                            </UFormField>
                            <template #content>
                                {{ formState.offline_qq_suffix === '' ? `${user?.player_id} | Minecraft离线` :
                                    `${user?.player_id} ${formState.offline_qq_suffix?.replaceAll('{s}', 'Minecraft')}` }}
                            </template>
                        </UTooltip>
                    </div>

                    <div class="flex justify-end">
                        <UButton :disabled="loading" @click="saveProfile">保存更改</UButton>
                    </div>
                </UForm>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <h2 class="text-lg font-semibold text-red-500">会话操作</h2>
            </template>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">退出登录</p>
                    <p class="text-sm text-gray-500">清除本地会话信息并返回登录页。</p>
                </div>
                <UButton color="error" variant="soft" @click="userLogout">退出登录</UButton>
            </div>
        </UCard>
    </div>
</template>