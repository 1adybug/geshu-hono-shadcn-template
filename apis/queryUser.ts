import type { QueryUserParams } from "@/schemas/queryUser"

import type { queryUser as sharedQueryUser } from "@/shared/queryUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function queryUser(params: QueryUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedQueryUser>>>(rpcClient.api["query-user"].$post({ json: params }))
}
