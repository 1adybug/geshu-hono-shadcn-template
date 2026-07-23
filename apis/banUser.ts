import type { BanUserParams } from "@/schemas/banUser"

import type { banUser as sharedBanUser } from "@/shared/banUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function banUser(params: BanUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedBanUser>>>(rpcClient.api["ban-user"].$post({ json: params }))
}
