import { deleteUser } from "@/apis/deleteUser"

import { createUseDeleteUser } from "@/presets/createUseDeleteUser"

export { deleteUser }

export const useDeleteUser = createUseDeleteUser(deleteUser)
