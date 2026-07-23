import { updateCurrentUserProfile } from "@/apis/updateCurrentUserProfile"

import { createUseUpdateCurrentUserProfile } from "@/presets/createUseUpdateCurrentUserProfile"

export { updateCurrentUserProfile }

export const useUpdateCurrentUserProfile = createUseUpdateCurrentUserProfile(updateCurrentUserProfile)
