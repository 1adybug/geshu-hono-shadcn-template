import { parseBlobResponse, rpcClient } from "@/utils/rpcClient"

export function getUserImportTemplate() {
    return parseBlobResponse(rpcClient.api["get-user-import-template"].$get())
}
