import type { LoginResponse, AuthedPlayerInfo } from '~/types/api'

/**
 * 用户认证与授权逻辑
 */
export const useAuth = () => {
    const { usePanelApi } = useApi()
    // 1. Token: 使用 Cookie 持久化，以便 SSR 也能获取
    const token = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 + 3600 // 25小时
    })

    // 2. User Info: 使用 useState 在应用内共享状态
    const user = useCookie<AuthedPlayerInfo | null>('auth_user', {
        maxAge: 60 * 60 * 24 + 3600 // 25小时
    })

    // 3. 验证码冷却: 使用 useState 共享倒计时数值
    const cooldown = useState<number>('auth_cooldown', () => 0)

    // 4. 冷却定时器引用: 使用 useState 防止路由切换丢失引用 (不需要在 SSR 共享，所以可以只在客户端处理)
    // 这里为了简单，我们使用一个模块级变量或者 Ref 也可以，但在 Composable 中 useState 更安全
    let timer: ReturnType<typeof setInterval> | null = null

    /**
     * 开启验证码倒计时
     */
    const startCooldown = () => {
        if (timer === null) {
            if (cooldown.value === 0) cooldown.value = 60
        } else {
            return
        }

        // 清除旧的定时器（如果有）
        if (timer) clearInterval(timer)

        timer = setInterval(() => {
            cooldown.value--
            if (cooldown.value <= 0 && timer) {
                clearInterval(timer)
                timer = null
                cooldown.value = 0
            }
        }, 1000)
    }

    /**
     * 登录成功处理
     * @param data 后端返回的登录数据
     */
    const setLoginSuccess = (data: LoginResponse) => {
        token.value = data.token
        if (data.user) {
            user.value = data.user
        }
        // 登录成功，跳转首页
        return navigateTo('/')
    }

    /**
     * 退出登录
     */
    const logout = () => {
        token.value = null
        user.value = { player_id: '', uuid: '', qq_id: '', permission: 0 }
        navigateTo('/login')
        return
    }

    /**
     * 退出登录
     */
    const userLogout = async () => {
        const response = await usePanelApi('get', '/player/logout')
        console.log(response.data)
        if (response.data === null) {
            useToast().add({ title: '成功登出', color: 'success' })
        }
        token.value = null
        user.value = { player_id: '', uuid: '', qq_id: '', permission: 0 }
        navigateTo('/login')
        return
    }

    return {
        token,
        user,
        cooldown,
        startCooldown,
        setLoginSuccess,
        logout,
        userLogout
    }
}