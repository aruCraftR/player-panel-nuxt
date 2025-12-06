export const useUi = () => {
    const isSidebarCollapsed = useState<boolean>('ui_sidebar_collapsed', () => true)

    /**
     * 切换侧边栏折叠状态
     */
    const toggleSidebar = () => {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    return {
        isSidebarCollapsed,
        toggleSidebar
    }
}