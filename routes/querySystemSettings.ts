import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, noInputAction } from "@/server/routeMiddleware"

import { querySystemSettings } from "@/shared/querySystemSettings"

export default honoFactory
    .createApp()
    .post("/", identifyAction("querySystemSettings"), noInputAction({ filter: isAdmin }), async context => jsonSuccess(context, await querySystemSettings()))
