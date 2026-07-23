import { queryPublicSystemSettingGroups } from "@/server/systemSettings"

export async function querySystemSettings() {
    const groups = await queryPublicSystemSettingGroups()
    return groups
}
