import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { identifyAction, noInputAction } from "@/server/routeMiddleware"

import { getInitializationStatus } from "@/shared/getInitializationStatus"

export default honoFactory
    .createApp()
    .get("/", identifyAction("getInitializationStatus"), noInputAction({ filter: false, operationLog: false, rateLimit: false }), async context =>
        jsonSuccess(context, await getInitializationStatus()))
