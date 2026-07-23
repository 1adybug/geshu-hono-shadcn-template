import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, noInputAction } from "@/server/routeMiddleware"
import { toResponseBody } from "@/server/toResponseBody"

import { getUserImportTemplate } from "@/shared/getUserImportTemplate"

export default honoFactory.createApp().get("/", identifyAction("getUserImportTemplate"), noInputAction({ filter: isAdmin }), async context => {
    const data = await getUserImportTemplate()
    context.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    context.header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent("用户导入模板.xlsx")}`)
    context.header("Cache-Control", "no-store")
    return context.body(toResponseBody(data))
})
