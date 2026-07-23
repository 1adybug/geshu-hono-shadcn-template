import { zValidator } from "@hono/zod-validator"

import { type QueryUserParams, queryUserSchema } from "@/schemas/queryUser"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { queryUser } from "@/shared/queryUser"

export default honoFactory
    .createApp()
    .post(
        "/",
        identifyAction("queryUser"),
        zValidator("json", queryUserSchema, validationHook),
        jsonAction<QueryUserParams>({ filter: isAdmin }),
        async context => jsonSuccess(context, await queryUser(context.req.valid("json"))),
    )
