import { getGeshuOAuthLoginStatus } from "@/server/geshuOAuth"

export async function queryGeshuOAuthLoginStatus() {
    return getGeshuOAuthLoginStatus()
}
