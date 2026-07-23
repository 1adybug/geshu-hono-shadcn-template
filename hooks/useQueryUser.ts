import { createUseQuery } from "soda-tanstack-query"

import { queryUser } from "@/apis/queryUser"

export { queryUser }

export const useQueryUser = createUseQuery({
    queryFn: queryUser,
    queryKey: "query-user",
})
