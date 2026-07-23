import type { UpdateUserParams } from "@/schemas/updateUser"

import type { updateUser as sharedUpdateUser } from "@/shared/updateUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function updateUser(params: UpdateUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedUpdateUser>>>(rpcClient.api["update-user"].$post({ json: params }))
}
