import { isNonNullable } from "deepsea-tools"
import { createUseQuery } from "soda-tanstack-query"

import { getUser } from "@/apis/getUser"

import type { UserIdParams } from "@/schemas/userId"

export { getUser }

export function getUserOptional(id?: UserIdParams | undefined) {
    return isNonNullable(id) ? getUser(id) : null
}

export const useGetUser = createUseQuery({
    queryFn: getUserOptional,
    queryKey: "get-user",
})
