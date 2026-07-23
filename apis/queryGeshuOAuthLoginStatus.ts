import type { queryGeshuOAuthLoginStatus as sharedQueryGeshuOAuthLoginStatus } from "@/shared/queryGeshuOAuthLoginStatus"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function queryGeshuOAuthLoginStatus() {
    return parseApiResponse<Awaited<ReturnType<typeof sharedQueryGeshuOAuthLoginStatus>>>(rpcClient.api["query-geshu-oauth-login-status"].$post())
}
