export const LoginPathname = "/login"

export const GeshuOAuthProviderId = "geshu-oauth"

export const IsBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"

export const IsServer = !IsBrowser
