import { tryGetContext } from "hono/context-storage"

import type { AppEnv } from "./hono"

export function getRequestHeaders() {
    return tryGetContext<AppEnv>()?.req.raw.headers ?? new Headers()
}
