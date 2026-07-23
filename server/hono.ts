import { createFactory } from "hono/factory"

import type { User } from "@/prisma/generated/client"

export interface AppVariables {
    action: string | undefined
    args: unknown[]
    sessionUser: Promise<User | undefined> | undefined
}

export interface AppEnv {
    Variables: AppVariables
}

export const honoFactory = createFactory<AppEnv>()
