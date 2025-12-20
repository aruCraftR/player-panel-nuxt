
import type { ApiResponse, ServerInfo, ServerProfile } from "~/types/api"
import { useStorage } from '@vueuse/core'

export const useData = () => {
    const { usePanelApi } = useApi()
    const { hiddenServers } = useUi()
    const serverProfiles = useStorage<Record<string, ServerProfile>>('data_server_profiles', {})

    const checkServerProfiles = async (serverInfoList: ServerInfo[]) => {
        const missingProfiles: string[] = []
        for (const info of serverInfoList) {
            const profile = serverProfiles.value[info.id]
            if (profile) {
                if (profile.edit_time >= info.profile_time) {
                    continue
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete serverProfiles.value[info.id]
                }
            }
            if (info.id in hiddenServers.value) continue
            missingProfiles.push(info.id)
        }
        if (missingProfiles.length) {
            const response: ApiResponse<ServerProfile[]> = await usePanelApi('post', '/server/get_profiles', missingProfiles)
            if (response.data) {
                for (const i of response.data)
                    serverProfiles.value[i.server_id] = i
            }
        }
        const existServerInfo: ServerInfo[] = []
        for (const i of serverInfoList) {
            if (i.id in serverProfiles.value) {
                existServerInfo.push(i)
            } else {
                hiddenServers.value.add(i.id)
            }
        }
        return existServerInfo
    }

    return {
        serverProfiles,
        checkServerProfiles,
    }
}