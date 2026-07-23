import { unbanUser } from "@/apis/unbanUser"

import { createUseUnbanUser } from "@/presets/createUseUnbanUser"

export { unbanUser }

export const useUnbanUser = createUseUnbanUser(unbanUser)
