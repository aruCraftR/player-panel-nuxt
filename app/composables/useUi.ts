import type { ServerInfo } from "~/types/api"

export const useUi = () => {
    const isSidebarCollapsed = useState<boolean>('ui_sidebar_collapsed', () => true)
    const serverList = useState<ServerInfo[]>('ui_servers', () => [])
    const hiddenServers = useState<Set<string>>('ui_servers', () => new Set())
    const lastFetchServerListTimestamp = useState<number>('ui_last_fetch_server_list_timestamp', () => 0)
    const isServerListLoaded = useState<boolean>('ui_server_list_loaded', () => false)
    const mcVersionList = useState<string[]>('ui_mc_version_list', () => [])

    /**
     * 切换侧边栏折叠状态
     */
    const toggleSidebar = () => {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    return {
        isSidebarCollapsed,
        serverList,
        lastFetchServerListTimestamp,
        isServerListLoaded,
        mcVersionList,
        hiddenServers,
        toggleSidebar
    }
}