import { genericOAuthClient, phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.PUBLIC_BETTER_AUTH_URL?.trim() || window.location.origin,
    plugins: [phoneNumberClient(), genericOAuthClient()],
})
