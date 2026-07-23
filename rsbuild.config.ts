import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { pluginSvgr } from "@rsbuild/plugin-svgr"
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss"
import { sdrrRsbuildPlugin } from "sdrr/rsbuild"

import { getDevelopmentClientPort, getDevelopmentServerPort } from "./server/port"

const clientPort = getDevelopmentClientPort()
const serverPort = getDevelopmentServerPort()

export default defineConfig({
    source: {
        entry: {
            index: "./index.tsx",
        },
    },
    html: {
        favicon: "./assets/geshu.svg",
        title: "格数科技",
        meta: {
            description: "powered by geshu",
        },
        mountId: "root",
    },
    plugins: [
        pluginReact({
            reactCompiler: true,
        }),
        pluginSvgr(),
        pluginTailwindcss(),
        sdrrRsbuildPlugin(),
    ],
    server: {
        port: clientPort,
        strictPort: true,
        proxy: {
            "/api": {
                target: `http://127.0.0.1:${serverPort}`,
            },
        },
        historyApiFallback: true,
    },
    output: {
        distPath: {
            root: "dist/client",
        },
        polyfill: "usage",
    },
})
