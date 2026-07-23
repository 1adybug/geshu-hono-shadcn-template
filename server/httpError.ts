import { HTTPException } from "hono/http-exception"

export function badRequest(message: string, cause?: unknown) {
    return new HTTPException(400, { message, cause })
}

export function unauthorized(message = "请先登录", cause?: unknown) {
    return new HTTPException(401, { message, cause })
}

export function forbidden(message = "无权限", cause?: unknown) {
    return new HTTPException(403, { message, cause })
}

export function tooManyRequests(message: string, cause?: unknown) {
    return new HTTPException(429, { message, cause })
}
