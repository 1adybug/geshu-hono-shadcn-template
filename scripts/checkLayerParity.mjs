import { readdir } from "node:fs/promises"
import { resolve } from "node:path"
import process from "node:process"

const layerNames = ["shared", "routes", "apis"]

async function getTypeScriptBasenames(layerName) {
    const entries = await readdir(resolve(layerName), { withFileTypes: true })
    return entries
        .filter(entry => entry.isFile() && entry.name.endsWith(".ts"))
        .map(entry => entry.name)
        .sort()
}

const layers = new Map(await Promise.all(layerNames.map(async layerName => [layerName, await getTypeScriptBasenames(layerName)])))
const expected = layers.get("shared") ?? []

const mismatches = []

for (const layerName of layerNames.slice(1)) {
    const actual = layers.get(layerName) ?? []
    const missing = expected.filter(filename => !actual.includes(filename))
    const extra = actual.filter(filename => !expected.includes(filename))

    if (missing.length || extra.length) mismatches.push({ layerName, missing, extra })
}

if (mismatches.length) {
    for (const { layerName, missing, extra } of mismatches) {
        if (missing.length) console.error(`[${layerName}] 缺少: ${missing.join(", ")}`)
        if (extra.length) console.error(`[${layerName}] 多出: ${extra.join(", ")}`)
    }

    process.exitCode = 1
} else console.log(`shared/routes/apis 已保持 ${expected.length} 个文件严格 1:1。`)
