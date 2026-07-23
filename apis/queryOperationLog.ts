import type { QueryOperationLogParams } from "@/schemas/queryOperationLog"

import type { queryOperationLog as sharedQueryOperationLog } from "@/shared/queryOperationLog"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function queryOperationLog(params: QueryOperationLogParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedQueryOperationLog>>>(rpcClient.api["query-operation-log"].$post({ json: params }))
}
