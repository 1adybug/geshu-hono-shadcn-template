import { zValidator } from "@hono/zod-validator"

import { type LoginParams, loginSchema } from "@/schemas/login"

import { jsonSuccess } from "@/server/apiResponse"
import { appendSetCookieHeaders } from "@/server/appendSetCookieHeaders"
import type { RateLimitContext } from "@/server/createRateLimit"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { login } from "@/shared/login"

function getRateLimitKey(context: RateLimitContext) {
    const params = context.args[0] as LoginParams | undefined
    return `login:${context.ip || "unknown-ip"}:${params?.account || "unknown-account"}`
}

export default honoFactory.createApp().post(
    "/",
    identifyAction("login"),
    zValidator("json", loginSchema, validationHook),
    jsonAction<LoginParams>({
        filter: false,
        rateLimit: {
            limit: 5,
            windowMs: 60_000,
            message: "登录尝试过于频繁，请稍后再试",
            getKey: getRateLimitKey,
        },
    }),
    async context => {
        const { user, headers } = await login(context.req.valid("json"))
        appendSetCookieHeaders(context, headers)
        return jsonSuccess(context, user)
    },
)
