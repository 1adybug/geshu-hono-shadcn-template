import type { Context } from "hono"

import type { AppEnv } from "./hono"

export function appendSetCookieHeaders(context: Context<AppEnv>, headers: Headers) {
    for (const value of headers.getSetCookie()) context.header("Set-Cookie", value, { append: true })
}
