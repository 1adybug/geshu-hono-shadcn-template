import { login } from "@/apis/login"

import { createUseLogin } from "@/presets/createUseLogin"

export { login }

export const useLogin = createUseLogin(login)
