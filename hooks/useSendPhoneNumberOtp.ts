import { sendPhoneNumberOtp } from "@/apis/sendPhoneNumberOtp"

import { createUseSendPhoneNumberOtp } from "@/presets/createUseSendPhoneNumberOtp"

export { sendPhoneNumberOtp }

export const useSendPhoneNumberOtp = createUseSendPhoneNumberOtp(sendPhoneNumberOtp)
