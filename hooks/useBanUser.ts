import { banUser } from "@/apis/banUser"

import { createUseBanUser } from "@/presets/createUseBanUser"

export { banUser }

export const useBanUser = createUseBanUser(banUser)
