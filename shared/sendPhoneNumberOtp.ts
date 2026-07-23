import { prisma } from "@/prisma"

import type { AccountParams } from "@/schemas/account"
import { phoneNumberRegex } from "@/schemas/phoneNumber"

import { auth } from "@/server/auth"
import { badRequest } from "@/server/httpError"

export interface SendPhoneNumberOtpResponse {
    phoneNumber: string
}

export async function sendPhoneNumberOtp(params: AccountParams): Promise<SendPhoneNumberOtpResponse> {
    const user = await prisma.user.findUnique({
        where: phoneNumberRegex.test(params) ? { phoneNumber: params } : { name: params },
    })

    if (!user) throw badRequest("用户名或手机号不存在")

    try {
        await auth.api.sendPhoneNumberOTP({
            body: {
                phoneNumber: user.phoneNumber,
            },
        })
    } catch (error) {
        throw badRequest("发送验证码失败", error)
    }

    return {
        phoneNumber: user.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
    }
}
