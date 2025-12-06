
export default defineNuxtRouteMiddleware((to, _from) => {
    // 获取 Token (useAuth 内部读取 Cookie)
    const { token } = useAuth()

    const publicRoutes = ['/login']

    if (!token.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    if (token.value && to.path === '/login') {
        return navigateTo('/')
    }
})