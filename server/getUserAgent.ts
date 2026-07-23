import { tryGetContext } from "hono/context-storage"

import type { AppEnv } from "./hono"

export function getUserAgent() {
    return tryGetContext<AppEnv>()?.req.header("user-agent")
}
