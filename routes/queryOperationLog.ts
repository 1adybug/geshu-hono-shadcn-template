import { zValidator } from "@hono/zod-validator"

import { type QueryOperationLogParams, queryOperationLogSchema } from "@/schemas/queryOperationLog"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { queryOperationLog } from "@/shared/queryOperationLog"

export default honoFactory
    .createApp()
    .post(
        "/",
        identifyAction("queryOperationLog"),
        zValidator("json", queryOperationLogSchema, validationHook),
        jsonAction<QueryOperationLogParams>({ filter: isAdmin }),
        async context => jsonSuccess(context, await queryOperationLog(context.req.valid("json"))),
    )
