import { getParser } from "."
import { z } from "zod/v4"

export const importUserSchema = z.object({
    file: z.instanceof(File, {
        message: "请选择 xlsx 文件",
    }),
})

export type ImportUserParams = z.infer<typeof importUserSchema>

export const importUserParser = getParser(importUserSchema)
