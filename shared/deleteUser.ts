import { prisma } from "@/prisma"

import type { UserIdParams } from "@/schemas/userId"

import { auth } from "@/server/auth"
import { getRequestHeaders } from "@/server/getRequestHeaders"
import { badRequest } from "@/server/httpError"

export async function deleteUser(id: UserIdParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw badRequest("用户不存在")
    const count = await prisma.user.count({ where: { role: "admin" } })
    if (count === 1 && user.role === "admin") throw badRequest("不能删除最后一个管理员")

    try {
        await auth.api.removeUser({
            body: {
                userId: id,
            },
            headers: getRequestHeaders(),
        })

        return user
    } catch (error) {
        throw badRequest("删除用户失败", error)
    }
}
