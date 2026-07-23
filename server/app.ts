import { styleText } from "node:util"

import { serveStatic } from "@hono/node-server/serve-static"
import type { ApplyGlobalResponse } from "hono/client"
import { compress } from "hono/compress"
import { contextStorage } from "hono/context-storage"
import { csrf } from "hono/csrf"
import { etag } from "hono/etag"
import { HTTPException } from "hono/http-exception"

import addUserRoute from "@/routes/addUser"
import banUserRoute from "@/routes/banUser"
import createFirstUserRoute from "@/routes/createFirstUser"
import deleteUserRoute from "@/routes/deleteUser"
import exportUserRoute from "@/routes/exportUser"
import getCurrentUserRoute from "@/routes/getCurrentUser"
import getInitializationStatusRoute from "@/routes/getInitializationStatus"
import getUserRoute from "@/routes/getUser"
import getUserImportTemplateRoute from "@/routes/getUserImportTemplate"
import importUserRoute from "@/routes/importUser"
import loginRoute from "@/routes/login"
import queryErrorLogRoute from "@/routes/queryErrorLog"
import queryGeshuOAuthLoginStatusRoute from "@/routes/queryGeshuOAuthLoginStatus"
import queryOperationLogRoute from "@/routes/queryOperationLog"
import querySystemSettingsRoute from "@/routes/querySystemSettings"
import queryUserRoute from "@/routes/queryUser"
import sendCurrentUserPhoneNumberOtpRoute from "@/routes/sendCurrentUserPhoneNumberOtp"
import sendPhoneNumberOtpRoute from "@/routes/sendPhoneNumberOtp"
import unbanUserRoute from "@/routes/unbanUser"
import updateCurrentUserProfileRoute from "@/routes/updateCurrentUserProfile"
import updateSystemSettingsRoute from "@/routes/updateSystemSettings"
import updateUserRoute from "@/routes/updateUser"

import type { ApiErrorResponse } from "@/types/api"

import { addErrorLog } from "./addErrorLog"
import { auth } from "./auth"
import { honoFactory } from "./hono"

const isProduction = process.env.NODE_ENV === "production"

const businessRoutes = honoFactory
    .createApp()
    .use("*", csrf())
    .route("/action/addUser", addUserRoute)
    .route("/action/banUser", banUserRoute)
    .route("/action/createFirstUser", createFirstUserRoute)
    .route("/action/deleteUser", deleteUserRoute)
    .route("/admin/user/export", exportUserRoute)
    .route("/current-user", getCurrentUserRoute)
    .route("/initialization", getInitializationStatusRoute)
    .route("/action/getUser", getUserRoute)
    .route("/admin/user/template", getUserImportTemplateRoute)
    .route("/admin/user/import", importUserRoute)
    .route("/action/login", loginRoute)
    .route("/action/queryErrorLog", queryErrorLogRoute)
    .route("/action/queryGeshuOAuthLoginStatus", queryGeshuOAuthLoginStatusRoute)
    .route("/action/queryOperationLog", queryOperationLogRoute)
    .route("/action/querySystemSettings", querySystemSettingsRoute)
    .route("/action/queryUser", queryUserRoute)
    .route("/action/sendCurrentUserPhoneNumberOtp", sendCurrentUserPhoneNumberOtpRoute)
    .route("/action/sendPhoneNumberOtp", sendPhoneNumberOtpRoute)
    .route("/action/unbanUser", unbanUserRoute)
    .route("/action/updateCurrentUserProfile", updateCurrentUserProfileRoute)
    .route("/action/updateSystemSettings", updateSystemSettingsRoute)
    .route("/action/updateUser", updateUserRoute)

const baseApp = honoFactory.createApp()

baseApp.use("*", contextStorage())
if (isProduction) baseApp.use("*", compress())

baseApp.get("/api/health", context => context.json({ success: true, data: { status: "ok" }, code: 200 }, 200))
baseApp.on(["GET", "POST", "PATCH", "PUT", "DELETE"], "/api/auth/*", context => auth.handler(context.req.raw))

const app = baseApp.route("/api", businessRoutes)

if (isProduction) {
    app.use("*", etag())
    app.use("*", serveStatic({ root: "./dist/client" }))
    app.get("*", serveStatic({ path: "./dist/client/index.html" }))
}

function getErrorStatus(error: unknown): ApiErrorResponse["code"] {
    if (!(error instanceof HTTPException)) return 500
    if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 429) return error.status
    return 500
}

function getErrorMessage(error: unknown, status: ApiErrorResponse["code"]) {
    if (error instanceof HTTPException && status !== 500 && error.message) return error.message
    if (status === 400) return "请求参数错误"
    if (status === 401) return "请先登录"
    if (status === 403) return "Forbidden"
    if (status === 404) return "Not Found"
    if (status === 429) return "操作过于频繁，请稍后再试"
    return "服务器内部错误"
}

app.onError(async (error, context) => {
    console.error(styleText("red", error instanceof Error ? error.message : String(error)))
    console.error(error)

    await addErrorLog({
        action: context.get("action"),
        args: context.get("args"),
        error,
    })

    const status = getErrorStatus(error)
    return context.json<ApiErrorResponse>(
        {
            success: false,
            message: getErrorMessage(error, status),
            code: status,
        },
        status,
    )
})

app.notFound(context =>
    context.json<ApiErrorResponse>(
        {
            success: false,
            message: "Not Found",
            code: 404,
        },
        404,
    ))

interface ErrorResponseSchema {
    json: ApiErrorResponse
}

interface GlobalErrorResponses {
    400: ErrorResponseSchema
    401: ErrorResponseSchema
    403: ErrorResponseSchema
    404: ErrorResponseSchema
    429: ErrorResponseSchema
    500: ErrorResponseSchema
}

export type AppType = ApplyGlobalResponse<typeof app, GlobalErrorResponses>

export { app }
