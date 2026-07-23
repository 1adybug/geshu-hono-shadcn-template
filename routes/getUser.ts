import { zValidator } from "@hono/zod-validator"

import { type UserIdParams, userIdSchema } from "@/schemas/userId"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { getUser } from "@/shared/getUser"

export default honoFactory
    .createApp()
    .post("/", identifyAction("getUser"), zValidator("json", userIdSchema, validationHook), jsonAction<UserIdParams>({ filter: isAdmin }), async context =>
        jsonSuccess(context, await getUser(context.req.valid("json"))))
