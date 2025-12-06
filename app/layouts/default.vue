<script setup lang="ts">
const route = useRoute()
const { isSidebarCollapsed, toggleSidebar } = useUi()
const { user, userLogout } = useAuth()

const links = [
    { label: '服务器状态', icon: 'i-heroicons-server', to: '/' },
    { label: '聊天', icon: 'i-heroicons-chat-bubble-left-right', to: '/chat' },
    { label: '玩家设置', icon: 'i-heroicons-user-circle', to: '/settings/player' },
]

useHead({
    meta: [{ property: 'og:title', content: `aruCraftR - ${route.meta.title}` }],
})

</script>

<template>
    <div
        class="relative flex h-screen w-full overflow-hidden text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-950">
        <aside class="z-20 flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-500">
            <!-- Logo -->
            <UContainer
                class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 shrink-0 p-0">
                <span v-if="!isSidebarCollapsed" class="font-bold text-primary-500 truncate px-2 text-lg tracking-wide">
                    aruCraftR
                </span>
                <UIcon v-else name="i-heroicons-cube-transparent" class="w-8 h-8 text-primary-500" />
            </UContainer>

            <!-- 菜单 -->
            <UContainer class="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                <UButton v-for="link in links" :key="link.to" :to="link.to" :icon="link.icon"
                    :label="isSidebarCollapsed ? '' : link.label" variant="ghost" color="neutral"
                    class="w-full justify-start transition-all" :class="{ 'justify-center px-0': isSidebarCollapsed }"
                    active-class="bg-primary-50 dark:bg-primary-900/10 text-primary-500" />
            </UContainer>

            <!-- 底部工具 -->
            <UContainer class="p-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 shrink-0">
                <ClientOnly>
                    <UButton :icon="$colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
                        color="neutral" variant="ghost" block
                        @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'">
                        <span v-if="!isSidebarCollapsed">{{ $colorMode.value === 'dark' ? '深色模式' : '浅色模式' }}</span>
                    </UButton>
                </ClientOnly>

                <UButton
                    :icon="isSidebarCollapsed ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'"
                    color="neutral" variant="ghost" block @click="toggleSidebar" />
            </UContainer>
        </aside>

        <!-- 主内容 -->
        <main class="flex-1 flex flex-col h-full relative z-10 transition-colors duration-300">
            <header
                class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <UIcon name="i-heroicons-home" class="text-gray-400" v-if="route.path === '/'" />
                    {{ route.meta.title || 'Player Panel' }}
                </h1>

                <div class="flex items-center gap-4">
                    <UPopover mode="hover">
                        <UAvatar
                            :src="`https://avatars.cloudhaven.gg/avatars/${user?.uuid || '853c80ef3c3749fdaa49938b674adae6'}`"
                            alt="Avatar" size="sm"
                            class="rounded-xs cursor-pointer ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900" />
                        <template #content>
                            <div class="p-2 w-48">
                                <div
                                    class="px-2 py-2 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700 mb-2">
                                    {{ user?.player_id || 'Player' }}
                                </div>
                                <UButton to="/settings/player" variant="ghost" color="neutral" icon="i-heroicons-user"
                                    block class="justify-start mb-1">玩家设置</UButton>
                                <!-- red -> error -->
                                <UButton variant="ghost" color="error" icon="i-heroicons-arrow-right-on-rectangle" block
                                    class="justify-start" @click="userLogout">退出登录
                                </UButton>
                            </div>
                        </template>
                    </UPopover>
                </div>
            </header>

            <div class="flex-1 overflow-auto p-6 relative">
                <slot />
            </div>
        </main>
    </div>
</template>