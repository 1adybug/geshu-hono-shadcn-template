import type { getCurrentUser as sharedGetCurrentUser } from "@/shared/getCurrentUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function getCurrentUser() {
    return parseApiResponse<Awaited<ReturnType<typeof sharedGetCurrentUser>>>(rpcClient.api["current-user"].$get())
}
