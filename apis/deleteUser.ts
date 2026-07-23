import type { UserIdParams } from "@/schemas/userId"

import type { deleteUser as sharedDeleteUser } from "@/shared/deleteUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function deleteUser(params: UserIdParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedDeleteUser>>>(rpcClient.api["delete-user"].$post({ json: params }))
}
