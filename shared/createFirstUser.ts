import { prisma } from "@/prisma"

import type { CreateFirstUserParams } from "@/schemas/createFirstUser"
import { UserRole } from "@/schemas/userRole"

import { auth } from "@/server/auth"
import { getRandomPassword } from "@/server/getRandomPassword"
import { getTempEmail } from "@/server/getTempEmail"
import { badRequest } from "@/server/httpError"

export async function createFirstUser({ name, nickname, phoneNumber }: CreateFirstUserParams) {
    const count = await prisma.user.count()
    if (count > 0) throw badRequest("禁止操作")

    try {
        const { user } = await auth.api.createUser({
            body: {
                name,
                email: getTempEmail(phoneNumber),
                password: getRandomPassword(),
                role: UserRole.管理员,
                data: {
                    nickname,
                    phoneNumber,
                },
            },
        })

        const user2 = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
        return user2
    } catch (error) {
        throw badRequest("初始化失败", error)
    }
}
