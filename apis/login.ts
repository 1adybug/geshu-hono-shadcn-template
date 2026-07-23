import type { LoginParams } from "@/schemas/login"

import type { login as sharedLogin } from "@/shared/login"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function login(params: LoginParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedLogin>>["user"]>(rpcClient.api.action.login.$post({ json: params }))
}
