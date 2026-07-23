import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { identifyAction, noInputAction } from "@/server/routeMiddleware"

import { queryGeshuOAuthLoginStatus } from "@/shared/queryGeshuOAuthLoginStatus"

export default honoFactory
    .createApp()
    .post("/", identifyAction("queryGeshuOAuthLoginStatus"), noInputAction({ filter: false }), async context =>
        jsonSuccess(context, await queryGeshuOAuthLoginStatus()))
