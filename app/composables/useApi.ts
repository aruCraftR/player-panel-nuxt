/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from '~/types/api'
import { useAuth } from './useAuth'
type Method = "get" | "post" | "head" | "patch" | "put" | "delete" | "connect" | "options" | "trace";

/**
 * 封装的高级 API 请求方法
 * @param url 请求路径
 * @param options 请求选项
 */
export const useApi = () => {
    const config = useRuntimeConfig()
    const toast = useToast()
    const usePanelApi = <T>(method: Method, url: string, body?: Record<string, any> | any[], options: any = {}) => {
        const { token, logout } = useAuth()
        const headers: Record<string, string> = {}
        if (token.value) {
            headers.Authorization = `Bearer ${token.value}`
        }

        return $fetch<ApiResponse<T>>(url, {
            baseURL: config.public.apiBase,
            method: method,
            body: body,
            headers: headers,
            ...options,

            onResponse({ response }) {
                const resData = response._data as ApiResponse<T>

                if (resData && resData.code !== 200) {
                    switch (resData.code) {
                        case 401:
                            toast.add({ title: 'aruCraftR API', description: '会话已过期, 请重新登录', color: 'error' });
                            logout()
                            break;
                        case 404:
                            toast.add({ title: 'aruCraftR API', description: '请求的API不存在', color: 'error' });
                            break;
                        default:
                            if (response.status === 200) toast.add({ title: 'aruCraftR API', description: resData.msg || '未知错误', color: 'warning' })
                    }
                }
            },

            onRequestError({ error }) {
                toast.add({ title: '网络错误', description: `${error.name}: ${error.message}`, color: 'error' });
            },

            onResponseError({ response }) {
                switch (response.status) {
                    case 401:
                        toast.add({ title: 'API错误', description: '会话失效, 请重新登录', color: 'error' });
                        logout()
                        break;
                    case 404:
                        toast.add({ title: 'API错误', description: '请求的API不存在', color: 'error' });
                        break;
                    default:
                        toast.add({ title: 'API错误', description: `Status: ${response.status}`, color: 'error' })
                }
            }
        })
    }

    const useExternalApi = <T>(base: string, method: Method, url: string, body?: Record<string, any>, bearer?: string, options: any = {}) => {
        const headers: Record<string, string> = {}
        if (bearer) {
            headers.Authorization = `Bearer ${bearer}`
        }

        return $fetch<T>(url, {
            baseURL: base,
            method: method,
            body: body,
            headers: headers,
            ...options,

            onRequestError({ error }) {
                toast.add({ title: `网络错误 (${base})`, description: `${error.name}: ${error.message}`, color: 'error' });
            },

            onResponseError({ response }) {
                switch (response.status) {
                    case 404:
                        toast.add({ title: 'API错误', description: '请求的API不存在', color: 'error' });
                        break;
                    default:
                        toast.add({ title: 'API错误', description: `Status: ${response.status}`, color: 'error' })
                }
            }
        })
    }

    return {
        usePanelApi,
        useExternalApi,
    }
}