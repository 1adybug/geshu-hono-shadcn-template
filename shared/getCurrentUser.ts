import { SystemSettingKey } from "@/constants/systemSettings"

import type { User } from "@/prisma/generated/client"

import { getSessionUser } from "@/server/getSessionUser"
import { getBooleanSystemSettingValue } from "@/server/systemSettings"

export interface CurrentUserData {
    user?: User
    allowUpdateNickname: boolean
    allowUpdatePhoneNumber: boolean
}

export async function getCurrentUser(): Promise<CurrentUserData> {
    const user = await getSessionUser()

    return {
        user,
        allowUpdateNickname: user ? await getBooleanSystemSettingValue(SystemSettingKey.允许修改昵称) : false,
        allowUpdatePhoneNumber: user ? await getBooleanSystemSettingValue(SystemSettingKey.允许修改手机号) : false,
    }
}
