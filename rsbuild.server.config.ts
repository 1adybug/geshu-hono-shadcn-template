import { createRequire } from "node:module"

import { defineConfig } from "@rsbuild/core"

interface PackageJson {
    dependencies?: Record<string, string>
}

const require = createRequire(import.meta.url)
const { dependencies = {} } = require("./package.json") as PackageJson

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const externals = Object.keys(dependencies).map(name => new RegExp(`^${escapeRegExp(name)}(?:/.*)?$`))

export default defineConfig({
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
