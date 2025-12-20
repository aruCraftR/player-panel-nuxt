import { ServerProfileEditor } from '#components'
import type { ServerProfile } from "~/types/api"

export const useEditor = () => {
    const overlay = useOverlay()
    const useServerProfileEditor = (profile?: ServerProfile) => {
        return new Promise<null>((resolve, reject) => {
            // 创建弹窗实例
            const modal = overlay.create(ServerProfileEditor)
            modal.open({
                // 传入初始数据
                initProfile: profile,

                // 当用户点击保存时
                onConfirm: () => {
                    resolve(null)
                    modal.close()
                },

                // 当用户取消时
                onCancel: () => {
                    reject(null)
                    modal.close()
                }
            })
        })
    }
    return { useServerProfileEditor, }
}
