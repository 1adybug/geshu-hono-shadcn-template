import { getParser } from "."
import { z } from "zod/v4"

export const createdBeforeSchema = z.union([
    z.date({ message: "无效的创建时间" }),
    z.iso.datetime({ message: "无效的创建时间" }).transform(value => new Date(value)),
])

export type CreatedBeforeParams = z.infer<typeof createdBeforeSchema>

export const createdBeforeParser = getParser(createdBeforeSchema)
