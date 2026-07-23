import { zValidator } from "@hono/zod-validator"

import { type UpdateCurrentUserProfileParams, updateCurrentUserProfileSchema } from "@/schemas/updateCurrentUserProfile"

import { jsonSuccess } from "@/server/apiResponse"
import type { RateLimitContext } from "@/server/createRateLimit"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { updateCurrentUserProfile } from "@/shared/updateCurrentUserProfile"

function getRateLimitKey(context: RateLimitContext) {
    return `update-current-user-profile:${context.ip || "unknown-ip"}`
}

export default honoFactory.createApp().post(
    "/",
    identifyAction("updateCurrentUserProfile"),
    zValidator("json", updateCurrentUserProfileSchema, validationHook),
    jsonAction<UpdateCurrentUserProfileParams>({
        rateLimit: {
            limit: 10,
            windowMs: 60_000,
            message: "资料更新过于频繁，请稍后再试",
            getKey: getRateLimitKey,
        },
    }),
    async context => jsonSuccess(context, await updateCurrentUserProfile(context.req.valid("json"))),
)
