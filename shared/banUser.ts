import { prisma } from "@/prisma"

import type { BanUserParams } from "@/schemas/banUser"

import { auth } from "@/server/auth"
import { getRequestHeaders } from "@/server/getRequestHeaders"
import { badRequest } from "@/server/httpError"

export async function banUser(params: BanUserParams) {
    try {
        const { user } = await auth.api.banUser({
            body: params,
            headers: getRequestHeaders(),
        })

        const user2 = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
        return user2
    } catch (error) {
        throw badRequest("封禁失败", error)
    }
}
