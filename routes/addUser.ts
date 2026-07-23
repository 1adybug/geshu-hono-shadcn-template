import { zValidator } from "@hono/zod-validator"

import { type AddUserParams, addUserSchema } from "@/schemas/addUser"

import { jsonSuccess } from "@/server/apiResponse"
import { honoFactory } from "@/server/hono"
import { isAdmin } from "@/server/isAdmin"
import { identifyAction, jsonAction, validationHook } from "@/server/routeMiddleware"

import { addUser } from "@/shared/addUser"

export default honoFactory
    .createApp()
    .post("/", identifyAction("addUser"), zValidator("json", addUserSchema, validationHook), jsonAction<AddUserParams>({ filter: isAdmin }), async context =>
        jsonSuccess(context, await addUser(context.req.valid("json"))))
