import { SystemSettingKey } from "@/constants/systemSettings"

import { prisma } from "@/prisma"

import type { UpdateCurrentUserProfileParams } from "@/schemas/updateCurrentUserProfile"

import { auth } from "@/server/auth"
import { getRequestHeaders } from "@/server/getRequestHeaders"
import { getSessionUser } from "@/server/getSessionUser"
import { badRequest, unauthorized } from "@/server/httpError"
import { getBooleanSystemSettingValue } from "@/server/systemSettings"

export async function updateCurrentUserProfile({ nickname, phoneNumber, oldOtp, newOtp }: UpdateCurrentUserProfileParams) {
    const user = await getSessionUser()
    if (!user) throw unauthorized()

    const requestHeaders = getRequestHeaders()
    const isPhoneNumberChanged = phoneNumber !== user.phoneNumber
    const isNicknameChanged = nickname !== user.nickname

    const [allowUpdateNickname, allowUpdatePhoneNumber] = await Promise.all([
        getBooleanSystemSettingValue(SystemSettingKey.允许修改昵称),
        getBooleanSystemSettingValue(SystemSettingKey.允许修改手机号),
    ])

    if (isPhoneNumberChanged && !allowUpdatePhoneNumber) throw badRequest("当前系统设置不允许用户修改手机号")

    if (isNicknameChanged && !allowUpdateNickname) throw badRequest("当前系统设置不允许用户修改昵称")

    if (isPhoneNumberChanged) {
        if (!oldOtp || !newOtp) throw badRequest("修改手机号时，请填写新旧手机号验证码")

        const count = await prisma.user.count({
            where: {
                phoneNumber,
                id: { not: user.id },
            },
        })

        if (count > 0) throw badRequest("手机号已存在")

        try {
            await auth.api.verifyPhoneNumber({
                body: {
                    phoneNumber: user.phoneNumber,
                    code: oldOtp,
                },
                headers: requestHeaders,
            })
        } catch (error) {
            throw badRequest("原手机号验证码错误", error)
        }

        try {
            await auth.api.verifyPhoneNumber({
                body: {
                    phoneNumber,
                    code: newOtp,
                    updatePhoneNumber: true,
                },
                headers: requestHeaders,
            })
        } catch (error) {
            throw badRequest("新手机号验证码错误", error)
        }
    }

    if (isNicknameChanged) {
        try {
            await auth.api.updateUser({
                body: {
                    nickname,
                },
                headers: requestHeaders,
            })
        } catch (error) {
            throw badRequest("更新昵称失败", error)
        }
    }

    const nextUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!nextUser) throw badRequest("用户不存在")

    return nextUser
}
