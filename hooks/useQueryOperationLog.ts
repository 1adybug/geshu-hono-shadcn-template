import { createUseQuery } from "soda-tanstack-query"

import { queryOperationLog } from "@/apis/queryOperationLog"

export { queryOperationLog }

export const useQueryOperationLog = createUseQuery({
    queryFn: queryOperationLog,
    queryKey: "query-operation-log",
})
