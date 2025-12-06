<script setup lang="ts">
import * as z from 'zod'
import type { ApiResponse, LoginResponse } from '~/types/api'
definePageMeta({
    layout: 'empty',
    title: '登录 - aruCraftR'
})

const { startCooldown, cooldown, setLoginSuccess, token } = useAuth()
const toast = useToast()
const loading = ref(false)

const passwordSchema = z.object({
    player_id: z.string('请填写玩家ID'),
    password: z.string('请填写密码')
})
type PasswordSchema = z.output<typeof passwordSchema>

const captchaSchema = z.object({
    player_id: z.string('请填写玩家ID'),
    captcha: z.string('请填写验证码')
})
type CaptchaSchema = z.output<typeof captchaSchema>

const passwordState = reactive<Partial<PasswordSchema>>({
    player_id: undefined,
    password: undefined
})
const captchaState = reactive<Partial<CaptchaSchema>>({
    player_id: undefined,
    captcha: undefined
})

const passwordLogin = async () => {
    if (token.value) { navigateTo('/'); return }
    loading.value = true
    const response: ApiResponse<LoginResponse> = await useApi('post', '/login/password', { 'player_id': passwordState.player_id, 'password': passwordState.password })
    if (response.code === 200 && response.data !== null) {
        toast.add({ title: '登录成功', description: `欢迎回到aruCraftR, ${response.data.user.player_id}`, color: 'success', icon: 'i-heroicons-check-circle' })
        setLoginSuccess(response.data)
    }
    loading.value = false
}


const captchaLogin = async () => {
    if (token.value) { navigateTo('/'); return }
    loading.value = true
    const response: ApiResponse<LoginResponse> = await useApi('post', '/login/captcha', { 'player_id': captchaState.player_id, 'captcha': captchaState.captcha })
    if (response.code === 200 && response.data !== null) {
        toast.add({ title: '登录成功', description: `欢迎回到aruCraftR, ${response.data.user.player_id}`, color: 'success', icon: 'i-heroicons-check-circle' })
        setLoginSuccess(response.data)
    }
    loading.value = false
}

const sendCaptcha = async () => {
    if (token.value) { navigateTo('/'); return }
    loading.value = true
    if (!captchaState.player_id) {
        toast.add({ title: '请输入正版ID', color: 'error' })
        return
    }
    if (cooldown.value > 0) {
        toast.add({ title: '请勿频繁发送验证码', color: 'warning' })
        return
    }
    startCooldown()
    const response = await useApi('post', '/login/send_captcha', { 'player_id': captchaState.player_id })
    if (response.code === 200) {
        toast.add({ title: '验证码已发送', color: 'success', description: '请查看服务器聊天栏以获取验证码', duration: 10000 })
    } else {
        cooldown.value = 5
    }
    loading.value = false
}


const items = [
    { slot: 'password', label: '密码登录' },
    { slot: 'captcha', label: '验证码登录' }
]
</script>

<template>
    <UContainer class="relative min-h-screen min-w-screen flex items-center justify-center overflow-hidden">
        <UCard class="box-border min-w-100 w-1/4 bg-accented">
            <template #header>
                aruCraftR玩家面板
            </template>

            <UTabs :items="items">
                <template #password>
                    <UForm :schema="passwordSchema" :state="passwordState" class="space-y-4" @submit="passwordLogin">
                        <UFormField name="player_id" class="h-13 w-full mt-5">
                            <UInput v-model="passwordState.player_id" placeholder="请输入玩家ID" class="w-full" />
                        </UFormField>

                        <UFormField name="password" class="h-13 w-full">
                            <UInput v-model="passwordState.password" placeholder="请输入密码" type="password"
                                class="w-full" />
                        </UFormField>

                        <UButton :disabled="loading || Boolean(token)" type="submit"
                            class="w-full justify-center items-center">
                            登录
                        </UButton>
                    </UForm>

                </template>
                <template #captcha>
                    <UForm :schema="captchaSchema" :state="captchaState" class="space-y-4" @submit="captchaLogin">
                        <UFormField name="player_id" class="h-13 w-full mt-5">
                            <UInput v-model="captchaState.player_id" placeholder="请输入玩家ID" class="w-full" />
                        </UFormField>

                        <UFormField name="captcha" class="h-13 w-full">
                            <div class="flex w-full">
                                <UInput v-model="captchaState.captcha" placeholder="请输入验证码" type="captcha"
                                    class="flex-1" />
                                <UButton type="button" class="ml-1 min-w-1/3 justify-center" name='send_captcha'
                                    :disabled="cooldown > 0" @click="sendCaptcha">
                                    {{ cooldown > 0 ? `${cooldown}s 后可重发` : '获取验证码' }}
                                </UButton>
                            </div>
                        </UFormField>

                        <UButton :disabled="loading || Boolean(token)" type="submit"
                            class="w-full justify-center items-center">
                            验证并登录
                        </UButton>
                    </UForm>

                </template>
            </UTabs>

            <template #footer>
                <UContainer class="flex justify-between">
                    <UModal title="如何注册账户" close>
                        <UButton variant="link">注册账户</UButton>
                        <template #body>
                            在QQ群内绑定正版ID后自动完成注册
                        </template>
                    </UModal>
                    <UModal title="忘记密码怎么办" close>
                        <UButton variant="link">忘记密码</UButton>
                        <template #body>
                            若忘记密码, 可使用验证码登录, 随后前往玩家设置更改密码
                        </template>
                    </UModal>
                </UContainer>
            </template>
        </UCard>
    </UContainer>
</template>