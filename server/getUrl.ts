import { tryGetContext } from "hono/context-storage"

import type { AppEnv } from "./hono"

export function getUrl() {
    return tryGetContext<AppEnv>()?.req.url
}
