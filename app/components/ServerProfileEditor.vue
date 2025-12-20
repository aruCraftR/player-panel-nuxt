<script setup lang="ts">
import type { ServerProfile } from '~/types/api';
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui';

const { mcVersionList } = useUi()
const { useExternalApi, usePanelApi } = useApi()
const profileSchema = z.object({
    server_id: z.string('请填写服务器ID').regex(RegExp('^[a-zA-Z0-9_-]+$', ''), '服务器ID只能包含字母、数字、_、-'),
    zh_cn_name: z.string('请填写服务器中文名').optional(),
    en_ww_name: z.string('请填写服务器英文名').optional(),
    mc_version: z.string('请填写服务器MC版本号').optional(),
    server_version: z.string('请填写服务器版本号').optional(),
    announcement: z.string('请填写公告').max(256, '长度超过限制').optional(),
})
type ProfileSchema = z.output<typeof profileSchema>
const loading = ref(false)

const props = defineProps<{
    initProfile?: ServerProfile
}>()

const emit = defineEmits<{
    (e: 'confirm' | 'cancel'): void
}>()

const lockServerID = props.initProfile !== undefined
const profileState: Partial<ProfileSchema> = reactive<Partial<ProfileSchema>>(lockServerID ? JSON.parse(JSON.stringify(props.initProfile)) : { 'server_id': '请填写服务器ID' })

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
    if (props.initProfile == event.data) {
        emit('confirm')
    }
    loading.value = true
    try {
        await usePanelApi('post', '/server/set_profile', event.data)
    } catch {
        return
    } finally {
        loading.value = false
    }
    emit('confirm')
}

const getMcVersions = async () => {
    if (!mcVersionList.value.length) {
        const res: { result: string[] } = await useExternalApi('https://mc-versions-api.net', 'get', '/api/java')
        mcVersionList.value = res.result
    }
    return mcVersionList.value
}
</script>

<template>
    <UModal :close="{ onClick: () => emit('cancel') }" :ui="{ footer: 'justify-end' }" :dismissible="false" scrollable
        :title="`编辑服务器 ${profileState.server_id}`">
        <template #body>
            <UForm id="server-profile-editor-form" :schema="profileSchema" :state="profileState" class="space-y-4"
                @submit="onSubmit">
                <UFormField label="服务器ID" name="server_id" required>
                    <UInput v-model="profileState.server_id" :disabled="lockServerID" />
                </UFormField>
                <div class="grid grid-cols-2 gap-6">
                    <UFormField label="服务器中文名" name="zh_cn_name" hint="可选">
                        <UInput v-model="profileState.zh_cn_name" class="w-full" placeholder="为空则显示服务器ID">
                            <template v-if="profileState.zh_cn_name?.length" #trailing>
                                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                    aria-label="清空" @click="profileState.zh_cn_name = ''" />
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="服务器英文名" name="en_ww_name" hint="可选">
                        <UInput v-model="profileState.en_ww_name" class="w-full" placeholder="为空则显示服务器ID">
                            <template v-if="profileState.en_ww_name?.length" #trailing>
                                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                    aria-label="清空" @click="profileState.en_ww_name = ''" />
                            </template>
                        </UInput>
                    </UFormField>
                </div>
                <div class="grid grid-cols-2 gap-6">
                    <UFormField label="MC版本" name="mc_version" hint="可选">
                        <USelect v-model="profileState.mc_version" @vue:mounted="getMcVersions()" color="neutral"
                            variant="soft" :items="mcVersionList" class="w-full" />
                    </UFormField>
                    <UFormField label="服务器版本" name="server_version" hint="可选">
                        <UInput v-model="profileState.server_version" class="w-full" placeholder="如整合包版本号">
                            <template v-if="profileState.server_version?.length" #trailing>
                                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                    aria-label="清空" @click="profileState.server_version = ''" />
                            </template>
                        </UInput>
                    </UFormField>
                </div>
                <UFormField label="公告" name="announcement" hint="可选">
                    <UTextarea v-model="profileState.announcement" class="w-full" autoresize />
                </UFormField>
            </UForm>
        </template>
        <template #footer>
            <div class="flex gap-2">
                <UButton color="neutral" label="取消" variant="outline" @click="emit('cancel')" />
                <UButton label="保存" type="submit" form="server-profile-editor-form" :disabled="loading" />
            </div>
        </template>
    </UModal>
</template>
