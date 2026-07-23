import type { UserIdParams } from "@/schemas/userId"

import type { getUser as sharedGetUser } from "@/shared/getUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function getUser(params: UserIdParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedGetUser>>>(rpcClient.api.action.getUser.$post({ json: params }))
}
