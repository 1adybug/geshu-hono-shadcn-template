import { createUseQuery } from "soda-tanstack-query"

import { getInitializationStatus } from "@/apis/getInitializationStatus"

export const useInitializationStatus = createUseQuery({
    queryFn: getInitializationStatus,
    queryKey: "initialization-status",
})
