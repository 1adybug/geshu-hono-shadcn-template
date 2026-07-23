import type { QueryErrorLogParams } from "@/schemas/queryErrorLog"

import type { queryErrorLog as sharedQueryErrorLog } from "@/shared/queryErrorLog"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function queryErrorLog(params: QueryErrorLogParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedQueryErrorLog>>>(rpcClient.api["query-error-log"].$post({ json: params }))
}
