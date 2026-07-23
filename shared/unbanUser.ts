import { prisma } from "@/prisma"

import type { UserIdParams } from "@/schemas/userId"

import { auth } from "@/server/auth"
import { getRequestHeaders } from "@/server/getRequestHeaders"
import { badRequest } from "@/server/httpError"

export async function unbanUser(userId: UserIdParams) {
    try {
        const { user } = await auth.api.unbanUser({
            body: { userId },
            headers: getRequestHeaders(),
        })

        const user2 = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
        return user2
    } catch (error) {
        throw badRequest("解封失败", error)
    }
}
