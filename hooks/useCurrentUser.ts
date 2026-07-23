import { createUseQuery } from "soda-tanstack-query"

import { getCurrentUser } from "@/apis/getCurrentUser"

export const useCurrentUser = createUseQuery({
    queryFn: getCurrentUser,
    queryKey: "current-user",
})
