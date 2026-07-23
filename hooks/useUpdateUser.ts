import { updateUser } from "@/apis/updateUser"

import { createUseUpdateUser } from "@/presets/createUseUpdateUser"

export { updateUser }

export const useUpdateUser = createUseUpdateUser(updateUser)
