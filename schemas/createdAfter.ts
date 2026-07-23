import { getParser } from "."
import { z } from "zod/v4"

export const createdAfterSchema = z.union([
    z.date({ message: "无效的创建时间" }),
    z.iso.datetime({ message: "无效的创建时间" }).transform(value => new Date(value)),
])

export type CreatedAfterParams = z.infer<typeof createdAfterSchema>

export const createdAfterParser = getParser(createdAfterSchema)
