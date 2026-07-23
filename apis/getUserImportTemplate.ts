import { parseBlobResponse, rpcClient } from "@/utils/rpcClient"

export function getUserImportTemplate() {
    return parseBlobResponse(rpcClient.api.admin.user.template.$get())
}
