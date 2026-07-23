import { zValidator } from "@hono/zod-validator"

import { type SendCurrentUserPhoneNumberOtpParams, sendCurrentUserPhoneNumberOtpSchema } from "@/schemas/sendCurrentUserPhoneNumberOtp"

import { jsonSuccess } from "@/server/apiResponse"
import type { RateLimitContext } from "@/server/createRateLimit"
import { honoFactory } from "@/server/hono"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { sendCurrentUserPhoneNumberOtp } from "@/shared/sendCurrentUserPhoneNumberOtp"

function getRateLimitKey(context: RateLimitContext) {
    const params = context.args[0] as SendCurrentUserPhoneNumberOtpParams | undefined
    return `send-current-user-phone-number-otp:${context.ip || "unknown-ip"}:${params?.phoneNumber || "unknown-phone-number"}`
}

export default honoFactory.createApp().post(
    "/",
    identifyAction("sendCurrentUserPhoneNumberOtp"),
    zValidator("json", sendCurrentUserPhoneNumberOtpSchema, validationHook),
    jsonAction<SendCurrentUserPhoneNumberOtpParams>({
        rateLimit: {
            limit: 1,
            windowMs: 60_000,
            message: "验证码发送过于频繁，请稍后再试",
            getKey: getRateLimitKey,
        },
    }),
    async context => jsonSuccess(context, await sendCurrentUserPhoneNumberOtp(context.req.valid("json"))),
)
