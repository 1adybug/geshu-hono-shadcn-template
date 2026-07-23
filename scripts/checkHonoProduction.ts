import { strict as assert } from "node:assert"
import { readdir } from "node:fs/promises"
import { join, relative, resolve, sep } from "node:path"
import process from "node:process"

assert.equal(process.env.NODE_ENV, "production")

const projectRoot = resolve(process.cwd())
const staticJavaScriptDirectory = join(projectRoot, "dist", "client", "static", "js")
const staticJavaScriptFiles = (await readdir(staticJavaScriptDirectory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith(".js"))
    .map(entry => join(staticJavaScriptDirectory, entry.name))

assert.ok(staticJavaScriptFiles.length > 0, "客户端构建应生成 JavaScript 静态资源")

const { app } = await import("../server/app")

const healthResponse = await app.request("/api/health")
assert.equal(healthResponse.status, 200)
assert.equal(healthResponse.headers.get("ETag"), null, "动态 API 不应附加静态资源 ETag")

const staticPath = `/${relative(join(projectRoot, "dist", "client"), staticJavaScriptFiles[0])
    .split(sep)
    .join("/")}`

const staticResponse = await app.request(staticPath, {
    headers: { "Accept-Encoding": "gzip" },
})

assert.equal(staticResponse.status, 200)
assert.equal(staticResponse.headers.get("Content-Encoding"), "gzip")
assert.ok(staticResponse.headers.get("ETag"), "生产静态资源应带 ETag")

const etag = staticResponse.headers.get("ETag") as string
const cachedResponse = await app.request(staticPath, {
    headers: {
        "Accept-Encoding": "gzip",
        "If-None-Match": etag,
    },
})
assert.equal(cachedResponse.status, 304)

const spaFallbackResponse = await app.request("/nested/spa/route")
assert.equal(spaFallbackResponse.status, 200)
assert.match(spaFallbackResponse.headers.get("Content-Type") ?? "", /text\/html/)
assert.ok(spaFallbackResponse.headers.get("ETag"))

console.log("Hono 生产压缩、静态 ETag 与 SPA fallback 验证通过。")
