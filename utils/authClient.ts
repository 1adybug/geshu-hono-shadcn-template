import { genericOAuthClient, phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const configuredBaseUrl = import.meta.env.PUBLIC_BETTER_AUTH_URL?.trim()
const baseUrl = import.meta.env.DEV ? window.location.origin : configuredBaseUrl || window.location.origin

export const authClient = createAuthClient({
    baseURL: baseUrl,
    plugins: [phoneNumberClient(), genericOAuthClient()],
})
