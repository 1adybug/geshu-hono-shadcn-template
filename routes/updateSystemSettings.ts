import { zValidator } from "@hono/zod-validator"

import { type UpdateSystemSettingsParams, updateSystemSettingsSchema } from "@/schemas/updateSystemSettings"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { updateSystemSettings } from "@/shared/updateSystemSettings"

export default honoFactory.createApp().post(
    "/",
    identifyAction("updateSystemSettings"),
    zValidator("json", updateSystemSettingsSchema, validationHook),
    jsonAction<UpdateSystemSettingsParams>({
        filter: isAdmin,
        rateLimit: {
            limit: 20,
            windowMs: 60_000,
            message: "系统设置保存过于频繁，请稍后再试",
        },
    }),
    async context => jsonSuccess(context, await updateSystemSettings(context.req.valid("json"))),
)
