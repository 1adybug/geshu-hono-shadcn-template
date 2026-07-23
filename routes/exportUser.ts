import { zValidator } from "@hono/zod-validator"

import { type ExportUserParams, exportUserSchema } from "@/schemas/exportUser"

import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"
import { toResponseBody } from "@/server/toResponseBody"

import { exportUser } from "@/shared/exportUser"

export default honoFactory
    .createApp()
    .post(
        "/",
        identifyAction("exportUser"),
        zValidator("json", exportUserSchema, validationHook),
        jsonAction<ExportUserParams>({ filter: isAdmin }),
        async context => {
            const data = await exportUser(context.req.valid("json"))
            context.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            context.header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent("用户列表.xlsx")}`)
            context.header("Cache-Control", "no-store")
            return context.body(toResponseBody(data))
        },
    )
