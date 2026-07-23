import { createUseQuery } from "soda-tanstack-query"

import { querySystemSettings } from "@/apis/querySystemSettings"

export { querySystemSettings }

export const useQuerySystemSettings = createUseQuery({
    queryFn: querySystemSettings,
    queryKey: "query-system-settings",
})
