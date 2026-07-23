import { HTTPException } from "hono/http-exception"

import { prisma } from "@/prisma"

import { stringifyParams } from "@/utils/stringifyParams"

import { getIp } from "./getIp"
import { getSessionUser } from "./getSessionUser"
import { getUserAgent } from "./getUserAgent"

function getConstructorName(obj: unknown): string {
    if (obj === undefined || obj === null) return "unknown"
    return obj.constructor.name
}

function getStringProperty(obj: unknown, key: string): string | undefined {
    return ((obj ?? {}) as any)[key]
}

export interface AddErrorLogParams {
    error: unknown
    action?: string
    args?: unknown[]
}

export async function addErrorLog({ error, action, args }: AddErrorLogParams) {
    try {
        const user = await getSessionUser()
        const params = stringifyParams(args)
        await prisma.$transaction([
            prisma.errorLog.create({
                data: {
                    type: getConstructorName(error),
                    message: getStringProperty(error, "message") ?? String(error),
                    stack: getStringProperty(error, "stack"),
                    action,
                    params,
                    ip: await getIp(),
                    userAgent: await getUserAgent(),
                    name: user?.name,
                    nickname: user?.nickname,
                    phoneNumber: user?.phoneNumber,
                    role: user?.role,
                    userId: user?.id,
                },
            }),
        ])

        if (error instanceof HTTPException && error.cause) {
            await addErrorLog({
                error: error.cause,
                action,
                args,
            })
        }
    } catch (error) {
        console.error(error)
    }
}
