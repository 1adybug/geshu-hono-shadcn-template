import type { Context } from "hono"

import type { ApiSuccessResponse } from "@/types/api"

import { type SerializedApiData, serializeApiData } from "@/utils/apiSerialization"

import type { AppEnv } from "./hono"

export function jsonSuccess<TData>(context: Context<AppEnv>, data: TData) {
    const response = {
        success: true,
        data: serializeApiData(data),
        code: 200,
    } as const satisfies ApiSuccessResponse<SerializedApiData<TData>>

    return context.json(response, 200)
}
