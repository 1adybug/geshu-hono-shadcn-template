import type { SendCurrentUserPhoneNumberOtpParams } from "@/schemas/sendCurrentUserPhoneNumberOtp"

import type { sendCurrentUserPhoneNumberOtp as sharedSendCurrentUserPhoneNumberOtp } from "@/shared/sendCurrentUserPhoneNumberOtp"

import { parseApiResponse, rpcClient } from "@/utils/rpcClient"

export function sendCurrentUserPhoneNumberOtp(params: SendCurrentUserPhoneNumberOtpParams) {
    return parseApiResponse<Awaited<ReturnType<typeof sharedSendCurrentUserPhoneNumberOtp>>>(
        rpcClient.api.action.sendCurrentUserPhoneNumberOtp.$post({ json: params }),
    )
}
