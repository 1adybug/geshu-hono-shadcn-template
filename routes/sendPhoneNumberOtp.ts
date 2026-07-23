import { zValidator } from "@hono/zod-validator"

import { type AccountParams, accountSchema } from "@/schemas/account"

import { jsonSuccess } from "@/server/apiResponse"
import type { RateLimitContext } from "@/server/createRateLimit"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { sendPhoneNumberOtp } from "@/shared/sendPhoneNumberOtp"

function getRateLimitKey(context: RateLimitContext) {
    return `send-phone-number-otp:${context.ip || "unknown-ip"}:${String(context.args[0] || "unknown-account")}`
}

export default honoFactory.createApp().post(
    "/",
    identifyAction("sendPhoneNumberOtp"),
    zValidator("json", accountSchema, validationHook),
    jsonAction<AccountParams>({
        filter: false,
        rateLimit: {
            limit: 1,
            windowMs: 60_000,
            message: "验证码发送过于频繁，请稍后再试",
            getKey: getRateLimitKey,
        },
    }),
    async context => jsonSuccess(context, await sendPhoneNumberOtp(context.req.valid("json"))),
)
