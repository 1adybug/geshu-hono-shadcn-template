import type { AddUserParams } from "@/schemas/addUser"

import type { addUser as sharedAddUser } from "@/shared/addUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function addUser(params: AddUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedAddUser>>>(rpcClient.api["add-user"].$post({ json: params }))
}
