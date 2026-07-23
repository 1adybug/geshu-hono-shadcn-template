import { zValidator } from "@hono/zod-validator"

import { type QueryErrorLogParams, queryErrorLogSchema } from "@/schemas/queryErrorLog"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { queryErrorLog } from "@/shared/queryErrorLog"

export default honoFactory
    .createApp()
    .post(
        "/",
        identifyAction("queryErrorLog"),
        zValidator("json", queryErrorLogSchema, validationHook),
        jsonAction<QueryErrorLogParams>({ filter: isAdmin }),
        async context => jsonSuccess(context, await queryErrorLog(context.req.valid("json"))),
    )
