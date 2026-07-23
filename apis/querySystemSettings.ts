import type { querySystemSettings as sharedQuerySystemSettings } from "@/shared/querySystemSettings"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function querySystemSettings() {
    return parseApiResponse<Awaited<ReturnType<typeof sharedQuerySystemSettings>>>(rpcClient.api["query-system-settings"].$post())
}
