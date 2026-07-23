import { prisma } from "@/prisma"

export interface InitializationStatus {
    initialized: boolean
}

export async function getInitializationStatus(): Promise<InitializationStatus> {
    const count = await prisma.user.count()
    return { initialized: count > 0 }
}
