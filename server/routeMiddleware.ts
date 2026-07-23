import type { Context } from "hono"
import { type $ZodError, flattenError } from "zod/v4/core"

import type { User } from "@/prisma/generated/client"

import { addOperationLog } from "./addOperationLog"
import { type RateLimitConfig, checkRateLimit } from "./createRateLimit"
import { getIp } from "./getIp"
import { getSessionUser } from "./getSessionUser"
import { type AppEnv, honoFactory } from "./hono"
import { badRequest, forbidden, tooManyRequests, unauthorized } from "./httpError"

export type ActionFilter = boolean | ((user: User) => boolean)

export interface ActionPolicy {
    filter?: ActionFilter
    operationLog?: boolean
    rateLimit?: boolean | RateLimitConfig
}

interface ValidatedJson<TInput> {
    json: TInput
}

interface JsonInput<TInput> {
    in: ValidatedJson<TInput>
    out: ValidatedJson<TInput>
}

interface ValidatedForm<TInput> {
    form: TInput
}

interface FormInput<TInput> {
    in: ValidatedForm<TInput>
    out: ValidatedForm<TInput>
}

interface ValidationResult {
    success: boolean
    error?: $ZodError
}

async function applyActionPolicy(context: Context<AppEnv>, args: unknown[], policy: ActionPolicy) {
    context.set("args", args)

    const rateLimitResult = await checkRateLimit({
        context: {
            action: context.get("action") ?? "unknown-action",
            args,
            ip: getIp(),
        },
        rateLimit: policy.rateLimit,
    })

    if (rateLimitResult && !rateLimitResult.allowed) throw tooManyRequests(rateLimitResult.message)

    const filter = policy.filter ?? true
    const user = filter ? await getSessionUser() : undefined

    if (typeof filter === "function") {
        if (!user) throw unauthorized()
        if (!filter(user)) throw forbidden()
    } else if (filter && !user) throw unauthorized()

    if (policy.operationLog !== false) {
        await addOperationLog({
            action: context.get("action") ?? "unknown-action",
            args,
        })
    }
}

export function identifyAction(action: string) {
    return honoFactory.createMiddleware(async (context, next) => {
        context.set("action", action)
        context.set("args", [])
        await next()
    })
}

export function jsonAction<TInput>(policy: ActionPolicy = {}) {
    return honoFactory.createMiddleware<JsonInput<TInput>>(async (context, next) => {
        await applyActionPolicy(context, [context.req.valid("json")], policy)
        await next()
    })
}

export function formAction<TInput>(policy: ActionPolicy = {}) {
    return honoFactory.createMiddleware<FormInput<TInput>>(async (context, next) => {
        await applyActionPolicy(context, [context.req.valid("form")], policy)
        await next()
    })
}

export function noInputAction(policy: ActionPolicy = {}) {
    return honoFactory.createMiddleware(async (context, next) => {
        await applyActionPolicy(context, [], policy)
        await next()
    })
}

export function validationHook(result: ValidationResult) {
    if (result.success || !result.error) return

    const { formErrors, fieldErrors } = flattenError(result.error)

    const message = formErrors
        .concat(
            Object.values(fieldErrors)
                .filter((value): value is string[] => Array.isArray(value))
                .flat(),
        )
        .join(", ")

    throw badRequest(message || "请求参数无效", result.error)
}
