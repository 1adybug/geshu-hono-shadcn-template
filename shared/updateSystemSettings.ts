import type { UpdateSystemSettingsParams } from "@/schemas/updateSystemSettings"

import { syncAutoBackupScheduler } from "@/server/autoBackup"
import { saveSystemSettings } from "@/server/systemSettings"

export async function updateSystemSettings(params: UpdateSystemSettingsParams) {
    const groups = await saveSystemSettings(params)
    await syncAutoBackupScheduler()

    return groups
}
