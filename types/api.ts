export interface ApiSuccessResponse<TData> {
    success: true
    data: TData
    code: 200
}

export interface ApiErrorResponse {
    success: false
    data?: undefined
    message: string
    code: 400 | 401 | 403 | 404 | 429 | 500
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse
