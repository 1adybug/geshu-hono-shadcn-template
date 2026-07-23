import type { CreateFirstUserParams } from "@/schemas/createFirstUser"

import type { createFirstUser as sharedCreateFirstUser } from "@/shared/createFirstUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function createFirstUser(params: CreateFirstUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedCreateFirstUser>>>(rpcClient.api["create-first-user"].$post({ json: params }))
}
