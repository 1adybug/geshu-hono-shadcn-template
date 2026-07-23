import { prisma } from "@/prisma"

import type { LoginParams } from "@/schemas/login"
import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { auth } from "@/server/auth"
import { badRequest } from "@/server/httpError"

export async function login({ account, otp }: LoginParams) {
    const user = await prisma.user.findUnique({
        where: phoneNumberRegex.test(account) ? { phoneNumber: account } : { name: account },
    })

    if (!user) throw badRequest("账号或验证码错误")

    try {
        const result = await auth.api.verifyPhoneNumber({
            body: {
                phoneNumber: user.phoneNumber,
                code: otp,
            },
            returnHeaders: true,
        })

        return {
            user,
            headers: result.headers,
        }
    } catch (error) {
        throw badRequest("账号或验证码错误", error)
    }
}
