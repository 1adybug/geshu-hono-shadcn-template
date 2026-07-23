import { prisma } from "@/prisma"

import type { UserIdParams } from "@/schemas/userId"

import { badRequest } from "@/server/httpError"

export async function getUser(id: UserIdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw badRequest("用户不存在")
    return user
}
