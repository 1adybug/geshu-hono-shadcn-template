import { zValidator } from "@hono/zod-validator"

import { type ImportUserParams, importUserSchema } from "@/schemas/importUser"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { formAction, identifyAction, validationHook } from "@/server/routeMiddleware"

import { importUser } from "@/shared/importUser"

export default honoFactory.createApp().post(
    "/",
    identifyAction("importUser"),
    zValidator("form", importUserSchema, validationHook),
    formAction<ImportUserParams>({
        filter: isAdmin,
        rateLimit: {
            limit: 5,
            windowMs: 60_000,
            message: "批量导入用户操作过于频繁，请稍后再试",
        },
    }),
    async context => jsonSuccess(context, await importUser(context.req.valid("form"))),
)
