import { zValidator } from "@hono/zod-validator"

import { type CreateFirstUserParams, createFirstUserSchema } from "@/schemas/createFirstUser"

import { jsonSuccess } from "@/server/apiResponse"
import type { RateLimitContext } from "@/server/createRateLimit"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { createFirstUser } from "@/shared/createFirstUser"

function getRateLimitKey(context: RateLimitContext) {
    return `create-first-user:${context.ip || "unknown-ip"}`
}

export default honoFactory.createApp().post(
    "/",
    identifyAction("createFirstUser"),
    zValidator("json", createFirstUserSchema, validationHook),
    jsonAction<CreateFirstUserParams>({
        filter: false,
        rateLimit: {
            limit: 2,
            windowMs: 300_000,
            message: "初始化尝试过于频繁，请稍后再试",
            getKey: getRateLimitKey,
        },
    }),
    async context => jsonSuccess(context, await createFirstUser(context.req.valid("json"))),
)
