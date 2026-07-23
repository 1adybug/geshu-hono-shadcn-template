import type { ImportUserParams } from "@/schemas/importUser"

import type { importUser as sharedImportUser } from "@/shared/importUser"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function importUser(params: ImportUserParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedImportUser>>>(rpcClient.api.admin.user.import.$post({ form: params }))
}
