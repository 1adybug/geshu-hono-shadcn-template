import { zValidator } from "@hono/zod-validator"

import { type UserIdParams, userIdSchema } from "@/schemas/userId"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { unbanUser } from "@/shared/unbanUser"

export default honoFactory
    .createApp()
    .post("/", identifyAction("unbanUser"), zValidator("json", userIdSchema, validationHook), jsonAction<UserIdParams>(), async context =>
        jsonSuccess(context, await unbanUser(context.req.valid("json"))))
