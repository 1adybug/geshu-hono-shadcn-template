import { sendCurrentUserPhoneNumberOtp } from "@/apis/sendCurrentUserPhoneNumberOtp"

import { createUseSendCurrentUserPhoneNumberOtp } from "@/presets/createUseSendCurrentUserPhoneNumberOtp"

export { sendCurrentUserPhoneNumberOtp }

export const useSendCurrentUserPhoneNumberOtp = createUseSendCurrentUserPhoneNumberOtp(sendCurrentUserPhoneNumberOtp)
