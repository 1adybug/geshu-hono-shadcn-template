import { updateSystemSettings } from "@/apis/updateSystemSettings"

import { createUseUpdateSystemSettings } from "@/presets/createUseUpdateSystemSettings"

export { updateSystemSettings }

export const useUpdateSystemSettings = createUseUpdateSystemSettings(updateSystemSettings)
