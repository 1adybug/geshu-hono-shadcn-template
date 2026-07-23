import type { ExportUserParams } from "@/schemas/exportUser"

import { parseBlobResponse, rpcClient } from "@/utils/rpcClient"

export function exportUser(params: ExportUserParams) {
    return parseBlobResponse(rpcClient.api["export-user"].$post({ json: params }))
}
