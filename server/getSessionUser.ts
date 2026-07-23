import { tryGetContext } from "hono/context-storage"

import { prisma } from "@/prisma"

import type { User } from "@/prisma/generated/client"

import { auth } from "./auth"
import { getRequestHeaders } from "./getRequestHeaders"
import type { AppEnv } from "./hono"

async function querySessionUser(): Promise<User | undefined> {
    const session = await auth.api.getSession({
        headers: getRequestHeaders(),
    })
    const user = session?.user
    if (!user) return undefined

    return (await prisma.user.findUnique({ where: { id: user.id } })) ?? undefined
}

export function getSessionUser() {
    const context = tryGetContext<AppEnv>()
    const cachedUser = context?.get("sessionUser")
    if (cachedUser) return cachedUser

    const user = querySessionUser()
    context?.set("sessionUser", user)
    return user
}
