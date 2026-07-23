import { type ClientResponse, DetailedError, hc, parseResponse } from "hono/client"

import type { AppType } from "@/server/app"

import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api"

import { toast } from "./toast"

export const rpcClient = hc<AppType>("/", {
    init: {
        credentials: "include",
    },
})

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    if (!value || typeof value !== "object") return false
    const response = value as Partial<ApiErrorResponse>
    return response.success === false && typeof response.message === "string" && typeof response.code === "number"
}

function isApiSuccessResponse(value: unknown): value is ApiSuccessResponse<unknown> {
    if (!value || typeof value !== "object") return false
    const response = value as Partial<ApiSuccessResponse<unknown>>
    return response.success === true && response.code === 200 && "data" in response
}

const dateFieldNames = new Set(["createdAt", "updatedAt", "expiresAt", "banExpires", "accessTokenExpiresAt", "refreshTokenExpiresAt"])

function reviveDateFields(value: unknown, key?: string): unknown {
    if (typeof value === "string" && key && dateFieldNames.has(key)) {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) return date
    }

    if (Array.isArray(value)) return value.map(item => reviveDateFields(item))

    if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, reviveDateFields(entryValue, entryKey)]))

    return value
}

function getRequestError(error: unknown) {
    const data = error instanceof DetailedError ? error.detail?.data : undefined
    const response = isApiErrorResponse(data) ? data : undefined
    const code = response?.code ?? (error instanceof DetailedError ? error.statusCode : undefined)
    const message = response?.message ?? (error instanceof Error ? error.message : "请求失败")

    if (code === 401 && window.location.pathname !== "/login") {
        const from = `${window.location.pathname}${window.location.search}`
        window.location.assign(`/login?from=${encodeURIComponent(from)}`)
    }

    toast.error(message)
    return new Error(message, { cause: error })
}

export async function parseApiResponse<TData>(response: Promise<ClientResponse<unknown>>) {
    try {
        const result = await parseResponse(response)
        if (!isApiSuccessResponse(result)) throw new Error("响应内容无效")
        return reviveDateFields(result.data) as TData
    } catch (error) {
        throw getRequestError(error)
    }
}

export async function parseBlobResponse(responsePromise: Promise<ClientResponse<unknown>>) {
    const response = await responsePromise

    if (!response.ok) {
        try {
            await parseResponse(response)
        } catch (error) {
            throw getRequestError(error)
        }

        throw getRequestError(new Error("下载失败"))
    }

    return response.blob()
}
