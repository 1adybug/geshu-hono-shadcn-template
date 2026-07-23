import { zValidator } from "@hono/zod-validator"

import { type UserIdParams, userIdSchema } from "@/schemas/userId"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { deleteUser } from "@/shared/deleteUser"

export default honoFactory.createApp().post(
    "/",
    identifyAction("deleteUser"),
    zValidator("json", userIdSchema, validationHook),
    jsonAction<UserIdParams>({
        filter: isAdmin,
        rateLimit: {
            limit: 20,
            windowMs: 60_000,
            message: "删除用户操作过于频繁，请稍后再试",
        },
    }),
    async context => jsonSuccess(context, await deleteUser(context.req.valid("json"))),
)
