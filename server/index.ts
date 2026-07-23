import { serve } from "@hono/node-server"

import { app } from "@/server/app"
import { startAutoBackupScheduler, stopAutoBackupScheduler } from "@/server/autoBackup"

void startAutoBackupScheduler().catch(error => void console.error("启动自动备份任务失败", error))

const port = Number(process.env.PORT || 3000)

const server = serve({
    fetch: app.fetch,
    hostname: process.env.HOSTNAME || "0.0.0.0",
    port,
})

console.log(`Hono server listening on http://0.0.0.0:${port}`)

export function shutdown() {
    stopAutoBackupScheduler()

    return new Promise<void>(
        resolve =>
            void server.close(error => {
                if (error) {
                    console.error(error)
                    process.exitCode = 1
                }

                resolve()
            }),
    )
}

process.once("SIGINT", () => void shutdown())
process.once("SIGTERM", () => void shutdown())
