import { zValidator } from "@hono/zod-validator"

import { type BanUserParams, banUserSchema } from "@/schemas/banUser"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { banUser } from "@/shared/banUser"

export default honoFactory
    .createApp()
    .post("/", identifyAction("banUser"), zValidator("json", banUserSchema, validationHook), jsonAction<BanUserParams>(), async context =>
        jsonSuccess(context, await banUser(context.req.valid("json"))))
