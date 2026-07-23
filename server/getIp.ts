import { getConnInfo } from "@hono/node-server/conninfo"
import { tryGetContext } from "hono/context-storage"

import type { AppEnv } from "./hono"

const TrustedClientIpHeader = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase()

function normalizeIp(value?: string | null) {
    const ip = value?.trim().replace(/^::ffff:/, "")
    return ip || undefined
}

function getTrustedHeaderIp(headerValue?: string) {
    if (!headerValue) return undefined
    if (TrustedClientIpHeader === "x-forwarded-for") return normalizeIp(headerValue.split(",").at(0))
    return normalizeIp(headerValue)
}

export function getIp() {
    const context = tryGetContext<AppEnv>()
    if (!context) return undefined

    if (TrustedClientIpHeader) {
        const trustedHeaderIp = getTrustedHeaderIp(context.req.header(TrustedClientIpHeader))
        if (trustedHeaderIp) return trustedHeaderIp
    }

    try {
        return normalizeIp(getConnInfo(context).remote.address)
    } catch {
        return undefined
    }
}
