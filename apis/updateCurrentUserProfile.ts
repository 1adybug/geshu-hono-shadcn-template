import type { UpdateCurrentUserProfileParams } from "@/schemas/updateCurrentUserProfile"

import type { updateCurrentUserProfile as sharedUpdateCurrentUserProfile } from "@/shared/updateCurrentUserProfile"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function updateCurrentUserProfile(params: UpdateCurrentUserProfileParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedUpdateCurrentUserProfile>>>(rpcClient.api["update-current-user-profile"].$post({ json: params }))
}
