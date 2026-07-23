import { addUser } from "@/apis/addUser"

import { createUseAddUser } from "@/presets/createUseAddUser"

export { addUser }

export const useAddUser = createUseAddUser(addUser)
