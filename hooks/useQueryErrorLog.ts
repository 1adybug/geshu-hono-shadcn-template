import { createUseQuery } from "soda-tanstack-query"

import { queryErrorLog } from "@/apis/queryErrorLog"

export { queryErrorLog }

export const useQueryErrorLog = createUseQuery({
    queryFn: queryErrorLog,
    queryKey: "query-error-log",
})
