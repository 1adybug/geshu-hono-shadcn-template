import type { UserIdParams } from "@/schemas/userId"

import type { unbanUser as sharedUnbanUser } from "@/shared/unbanUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function unbanUser(params: UserIdParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedUnbanUser>>>(rpcClient.api["unban-user"].$post({ json: params }))
}
