import type { Context } from "hono"

import type { ApiSuccessResponse } from "@/types/api"

import type { AppEnv } from "./hono"

export function jsonSuccess<TData>(context: Context<AppEnv>, data: TData) {
    const response = {
        success: true,
        data,
        code: 200,
    } as const satisfies ApiSuccessResponse<TData>

    return context.json(response, 200)
}
