import { zValidator } from "@hono/zod-validator"

import { type UpdateUserParams, updateUserSchema } from "@/schemas/updateUser"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { updateUser } from "@/shared/updateUser"

export default honoFactory.createApp().post(
    "/",
    identifyAction("updateUser"),
    zValidator("json", updateUserSchema, validationHook),
    jsonAction<UpdateUserParams>({
        filter: isAdmin,
        rateLimit: {
            limit: 30,
            windowMs: 60_000,
            message: "更新用户操作过于频繁，请稍后再试",
        },
    }),
    async context => jsonSuccess(context, await updateUser(context.req.valid("json"))),
)
