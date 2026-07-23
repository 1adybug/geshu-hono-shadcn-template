import { prisma } from "@/prisma"

import type { AddUserParams } from "@/schemas/addUser"

import { auth } from "@/server/auth"
import { getRandomPassword } from "@/server/getRandomPassword"
import { getTempEmail } from "@/server/getTempEmail"
import { badRequest } from "@/server/httpError"

export async function addUser({ name, nickname, phoneNumber, role }: AddUserParams) {
    const phoneNumberCount = await prisma.user.count({ where: { phoneNumber } })
    if (phoneNumberCount > 0) throw badRequest("手机号已被注册")

    const email = getTempEmail(phoneNumber)
    const emailCount = await prisma.user.count({ where: { email: email } })
    if (emailCount > 0) throw badRequest("邮箱已被注册")

    try {
        const { user } = await auth.api.createUser({
            body: {
                name,
                email,
                password: getRandomPassword(),
                role,
                data: {
                    nickname,
                    phoneNumber,
                },
            },
        })

        const user2 = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
        return user2
    } catch (error) {
        throw badRequest("新增用户失败", error)
    }
}
