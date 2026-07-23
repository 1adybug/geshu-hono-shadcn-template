import { SystemSettingKey } from "@/constants/systemSettings"

import { prisma } from "@/prisma"

import type { SendCurrentUserPhoneNumberOtpParams } from "@/schemas/sendCurrentUserPhoneNumberOtp"

import { auth } from "@/server/auth"
import { getSessionUser } from "@/server/getSessionUser"
import { badRequest, unauthorized } from "@/server/httpError"
import { getBooleanSystemSettingValue } from "@/server/systemSettings"

export interface SendCurrentUserPhoneNumberOtpResponse {
    phoneNumber: string
}

export async function sendCurrentUserPhoneNumberOtp({ phoneNumber }: SendCurrentUserPhoneNumberOtpParams): Promise<SendCurrentUserPhoneNumberOtpResponse> {
    const user = await getSessionUser()
    if (!user) throw unauthorized()

    const allowUpdatePhoneNumber = await getBooleanSystemSettingValue(SystemSettingKey.允许修改手机号)
    if (!allowUpdatePhoneNumber) throw badRequest("当前系统设置不允许用户修改手机号")

    if (phoneNumber !== user.phoneNumber) {
        const count = await prisma.user.count({
            where: {
                phoneNumber,
                id: { not: user.id },
            },
        })

        if (count > 0) throw badRequest("手机号已存在")
    }

    try {
        await auth.api.sendPhoneNumberOTP({
            body: {
                phoneNumber,
            },
        })
    } catch (error) {
        throw badRequest("发送验证码失败", error)
    }

    return {
        phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
    }
}
