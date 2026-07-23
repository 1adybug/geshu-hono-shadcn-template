import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { identifyAction, noInputAction } from "@/server/routeMiddleware"

import { getCurrentUser } from "@/shared/getCurrentUser"

export default honoFactory
    .createApp()
    .get("/", identifyAction("getCurrentUser"), noInputAction({ filter: false, operationLog: false, rateLimit: false }), async context =>
        jsonSuccess(context, await getCurrentUser()))
