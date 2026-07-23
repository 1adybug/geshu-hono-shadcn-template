import type { AccountParams } from "@/schemas/account"

import type { sendPhoneNumberOtp as sharedSendPhoneNumberOtp } from "@/shared/sendPhoneNumberOtp"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function sendPhoneNumberOtp(params: AccountParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedSendPhoneNumberOtp>>>(rpcClient.api["send-phone-number-otp"].$post({ json: params }))
}
