import { prisma } from "@/prisma"
import { defaultUserSelect } from "@/prisma/getUserSelect"

import type { ExportUserParams } from "@/schemas/exportUser"

import { createUserExportWorkbook } from "@/server/userWorkbook"

import { getQueryUserOrderBy, getQueryUserWhere } from "./queryUser"

export async function exportUser(params: ExportUserParams) {
    const data = await prisma.user.findMany({
        where: getQueryUserWhere(params),
        select: defaultUserSelect,
        orderBy: getQueryUserOrderBy(params),
    })

    return createUserExportWorkbook(data)
}
