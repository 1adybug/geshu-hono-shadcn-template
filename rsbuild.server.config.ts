import { type ChildProcess, spawn } from "node:child_process"
import { createRequire } from "node:module"

import { type RsbuildPlugin, defineConfig } from "@rsbuild/core"

interface PackageJson {
    dependencies?: Record<string, string>
}

const require = createRequire(import.meta.url)
const { dependencies = {} } = require("./package.json") as PackageJson

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const externals = Object.keys(dependencies).map(name => new RegExp(`^${escapeRegExp(name)}(?:/.*)?$`))

function startServerPlugin(): RsbuildPlugin {
    let serverProcess: ChildProcess | undefined

    function stopServer() {
        serverProcess?.kill()
        serverProcess = undefined
    }

    return {
        name: "start-server",
        setup(api) {
            api.onAfterBuild(({ stats }) => {
                if (serverProcess || stats?.hasErrors()) return

                serverProcess = spawn(process.execPath, ["--watch", "--env-file-if-exists=.env", "dist/server/index.mjs"], { stdio: "inherit" })
                serverProcess.once("exit", () => void (serverProcess = undefined))
            })

            api.onCloseBuild(stopServer)
            api.onExit(stopServer)
        },
    }
}

export default defineConfig({
    plugins: process.env.RSBUILD_RUN_SERVER === "true" ? [startServerPlugin()] : [],
    source: {
        entry: {
            index: "./server/index.ts",
        },
    },
    output: {
        target: "node",
        distPath: {
            root: "dist/server",
        },
        filename: {
            js: "[name].mjs",
        },
        externals,
        minify: false,
    },
})
