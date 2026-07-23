import type { getInitializationStatus as sharedGetInitializationStatus } from "@/shared/getInitializationStatus"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function getInitializationStatus() {
    return parseApiResponse<Awaited<ReturnType<typeof sharedGetInitializationStatus>>>(rpcClient.api["get-initialization-status"].$get())
}
