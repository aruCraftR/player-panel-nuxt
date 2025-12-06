/* eslint-disable @typescript-eslint/no-explicit-any */
// types/api.d.ts

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    data: T | null;
}

/**
 * 登录返回的数据结构
 */
export interface LoginResponse {
    token: string;
    user: UserInfo;
}

export interface UserInfo {
    player_id: string;
    uuid: string;
    qq_id: string;
}

