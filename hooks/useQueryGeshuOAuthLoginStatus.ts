import { createUseQuery } from "soda-tanstack-query"

import { queryGeshuOAuthLoginStatus } from "@/apis/queryGeshuOAuthLoginStatus"

export { queryGeshuOAuthLoginStatus }

export const useQueryGeshuOAuthLoginStatus = createUseQuery({
    queryFn: queryGeshuOAuthLoginStatus,
    queryKey: "query-geshu-oauth-login-status",
})
