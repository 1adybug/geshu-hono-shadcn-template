import { prisma } from "@/prisma"

import type { UpdateUserParams } from "@/schemas/updateUser"
import { UserRole } from "@/schemas/userRole"

import { auth } from "@/server/auth"
import { getRequestHeaders } from "@/server/getRequestHeaders"
import { badRequest } from "@/server/httpError"

export async function updateUser({ id, name, nickname, phoneNumber, role }: UpdateUserParams) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw badRequest("用户不存在")

    const nextPhoneNumber = phoneNumber ?? user.phoneNumber
    const nextRole = role ?? user.role

    const phoneNumberCount = await prisma.user.count({ where: { phoneNumber: nextPhoneNumber, id: { not: id } } })
    if (phoneNumberCount > 0) throw badRequest("手机号已存在")

    if (nextRole === UserRole.用户 && user.role === UserRole.管理员) {
        const adminCount = await prisma.user.count({ where: { role: UserRole.管理员 } })
        if (adminCount === 1) throw badRequest("不能将最后一个管理员降级为普通用户")
    }

    try {
        await auth.api.adminUpdateUser({
            body: {
                userId: id,
                data: {
                    name,
                    nickname,
                    phoneNumber,
                    role,
                },
            },
            headers: getRequestHeaders(),
        })

        const user3 = await prisma.user.findUniqueOrThrow({ where: { id } })
        return user3
    } catch (error) {
        throw badRequest("更新用户失败", error)
    }
}
