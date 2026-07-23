import { createFirstUser } from "@/apis/createFirstUser"

import { createUseCreateFirstUser } from "@/presets/createUseCreateFirstUser"

export { createFirstUser }

export const useCreateFirstUser = createUseCreateFirstUser(createFirstUser)
