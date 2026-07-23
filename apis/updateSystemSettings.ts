import type { UpdateSystemSettingsParams } from "@/schemas/updateSystemSettings"

import type { updateSystemSettings as sharedUpdateSystemSettings } from "@/shared/updateSystemSettings"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function updateSystemSettings(params: UpdateSystemSettingsParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedUpdateSystemSettings>>>(rpcClient.api.action.updateSystemSettings.$post({ json: params }))
}
