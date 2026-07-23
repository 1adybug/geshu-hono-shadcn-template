import { getParser } from "."
import { z } from "zod/v4"

export const updatedAfterSchema = z.union([
    z.date({ message: "无效的更新时间" }),
    z.iso.datetime({ message: "无效的更新时间" }).transform(value => new Date(value)),
])

export type UpdatedAfterParams = z.infer<typeof updatedAfterSchema>

export const updatedAfterParser = getParser(updatedAfterSchema)
