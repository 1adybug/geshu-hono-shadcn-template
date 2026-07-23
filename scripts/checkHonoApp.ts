import { strict as assert } from "node:assert"
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { utils, write } from "@1adybug/xlsx"
import Database from "better-sqlite3"

import type { PrismaClient } from "@/prisma/generated/client"

import { toResponseBody } from "@/server/toResponseBody"

interface ApiEnvelope {
    success: boolean
    code: number
    data?: unknown
}

interface UserIdentifier {
    id: string
}

interface CurrentUserEnvelopeData {
    user?: UserIdentifier
}

interface ImportResultData {
    total: number
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const validationRoot = await mkdtemp(join(tmpdir(), "geshu-hono-validation-"))
const validationDataPath = join(validationRoot, "data")
const databasePath = join(validationDataPath, "development.db")

await mkdir(validationDataPath)

const migrationSql = await readFile(join(projectRoot, "prisma", "migrations", "20260723071500_init", "migration.sql"), "utf8")
new Database(databasePath).exec(migrationSql).close()

process.chdir(validationRoot)
let prismaClient: PrismaClient | undefined
const originalConsoleError = console.error
console.error = () => undefined

async function readEnvelope(response: Response) {
    return (await response.json()) as ApiEnvelope
}

function getCookieHeader(response: Response) {
    const cookies = response.headers.getSetCookie().map(value => value.split(";", 1)[0])
    assert.ok(cookies.length > 0, "登录响应应设置会话 Cookie")
    return cookies.join("; ")
}

try {
    const [{ app }, rateLimit, { prisma }] = await Promise.all([import("../server/app"), import("../server/createRateLimit"), import("../prisma")])
    prismaClient = prisma

    rateLimit.setGlobalRateLimitEnabled(false)

    const healthResponse = await app.request("/api/health")
    assert.equal(healthResponse.status, 200)
    assert.deepEqual(await healthResponse.json(), { success: true, data: { status: "ok" }, code: 200 })

    const notFoundResponse = await app.request("/missing")
    assert.equal(notFoundResponse.status, 404)
    assert.equal((await readEnvelope(notFoundResponse)).code, 404)

    const invalidResponse = await app.request("/api/action/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    })
    assert.equal(invalidResponse.status, 400)
    assert.equal((await readEnvelope(invalidResponse)).code, 400)

    const unauthorizedResponse = await app.request("/api/action/queryUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    })
    assert.equal(unauthorizedResponse.status, 401)
    assert.equal((await readEnvelope(unauthorizedResponse)).code, 401)

    const crossOriginForm = new FormData()
    crossOriginForm.set("file", new File(["invalid"], "users.xlsx"))
    const csrfResponse = await app.request("/api/admin/user/import", {
        method: "POST",
        headers: { Origin: "https://untrusted.example" },
        body: crossOriginForm,
    })
    assert.equal(csrfResponse.status, 403)
    assert.equal((await readEnvelope(csrfResponse)).code, 403)

    const sameOriginResponse = await app.request("/api/admin/user/import", {
        method: "POST",
        headers: { Origin: "http://localhost" },
        body: new FormData(),
    })
    assert.equal(sameOriginResponse.status, 400)

    const betterAuthResponse = await app.request("/api/auth/phone-number/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "https://untrusted.example",
        },
        body: "phoneNumber=13800138000&code=1234",
    })
    assert.notEqual(await betterAuthResponse.text(), "Forbidden")

    const createResponse = await app.request("/api/action/createFirstUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost",
        },
        body: JSON.stringify({
            name: "admin",
            nickname: "管理员",
            phoneNumber: "13800138000",
        }),
    })
    assert.equal(createResponse.status, 200)

    const createEnvelope = await readEnvelope(createResponse)
    assert.equal(createEnvelope.success, true)
    const createdUser = createEnvelope.data as UserIdentifier

    const loginResponse = await app.request("/api/action/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost",
        },
        body: JSON.stringify({
            account: "admin",
            otp: "1234",
        }),
    })
    assert.equal(loginResponse.status, 200)
    const cookie = getCookieHeader(loginResponse)

    const currentUserResponse = await app.request("/api/current-user", {
        headers: { Cookie: cookie },
    })
    assert.equal(currentUserResponse.status, 200)
    assert.equal(((await readEnvelope(currentUserResponse)).data as CurrentUserEnvelopeData).user?.id, createdUser.id)

    const dateQueryResponse = await app.request("/api/action/queryUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
        },
        body: JSON.stringify({
            createdAfter: new Date(0).toISOString(),
        }),
    })
    assert.equal(dateQueryResponse.status, 200)

    const templateResponse = await app.request("/api/admin/user/template", {
        headers: { Cookie: cookie },
    })
    assert.equal(templateResponse.status, 200)
    assert.match(templateResponse.headers.get("Content-Type") ?? "", /spreadsheetml/)
    assert.match(templateResponse.headers.get("Content-Disposition") ?? "", /attachment/)
    assert.ok((await templateResponse.arrayBuffer()).byteLength > 0)

    const importWorkbook = utils.book_new()

    const importWorksheet = utils.aoa_to_sheet([
        ["用户名", "昵称", "手机号", "角色"],
        ["test_user", "测试用户", "13900139000", "用户"],
    ])

    utils.book_append_sheet(importWorkbook, importWorksheet, "用户")
    const importWorkbookData = write(importWorkbook, {
        type: "buffer",
        bookType: "xlsx",
    }) as Uint8Array
    const importForm = new FormData()
    importForm.set("file", new File([toResponseBody(importWorkbookData)], "users.xlsx"))

    const importResponse = await app.request("/api/admin/user/import", {
        method: "POST",
        headers: {
            Cookie: cookie,
            Origin: "http://localhost",
        },
        body: importForm,
    })
    assert.equal(importResponse.status, 200)
    assert.equal(((await readEnvelope(importResponse)).data as ImportResultData).total, 1)

    const exportResponse = await app.request("/api/admin/user/export", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
        },
        body: JSON.stringify({}),
    })
    assert.equal(exportResponse.status, 200)
    assert.match(exportResponse.headers.get("Content-Type") ?? "", /spreadsheetml/)
    assert.match(exportResponse.headers.get("Content-Disposition") ?? "", /attachment/)
    assert.ok((await exportResponse.arrayBuffer()).byteLength > 0)

    rateLimit.setGlobalRateLimitStore(rateLimit.createMemoryRateLimitStore())

    rateLimit.setGlobalRateLimitOptions({
        limit: 1,
        windowMs: 60_000,
        prefix: "hono-validation",
    })

    rateLimit.setGlobalRateLimitEnabled(true)

    const firstIpResponse = await app.request("/api/action/queryGeshuOAuthLoginStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "203.0.113.1",
        },
    })
    const secondIpResponse = await app.request("/api/action/queryGeshuOAuthLoginStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "203.0.113.2",
        },
    })
    const limitedResponse = await app.request("/api/action/queryGeshuOAuthLoginStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "203.0.113.1",
        },
    })

    assert.equal(firstIpResponse.status, 200)
    assert.equal(secondIpResponse.status, 200)
    assert.equal(limitedResponse.status, 429)
    assert.equal((await readEnvelope(limitedResponse)).code, 429)

    rateLimit.setGlobalRateLimitEnabled(false)

    const updateDatabase = new Database(databasePath)
    updateDatabase.prepare('UPDATE "user" SET "role" = ? WHERE "id" = ?').run("user", createdUser.id)
    updateDatabase.close()

    const forbiddenResponse = await app.request("/api/action/queryUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
        },
        body: JSON.stringify({}),
    })
    assert.equal(forbiddenResponse.status, 403)
    assert.equal((await readEnvelope(forbiddenResponse)).code, 403)

    new Database(databasePath).exec('DROP TABLE "user"').close()

    const serverErrorResponse = await app.request("/api/initialization")
    assert.equal(serverErrorResponse.status, 500)
    assert.equal((await readEnvelope(serverErrorResponse)).code, 500)

    console.log("Hono app.request 行为验证通过。")
} finally {
    console.error = originalConsoleError
    await prismaClient?.$disconnect()
    process.chdir(projectRoot)
    await rm(validationRoot, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 100,
    })
}
