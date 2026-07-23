import { getParser } from "."
import { z } from "zod/v4"

export const updatedBeforeSchema = z.union([
    z.date({ message: "无效的更新时间" }),
    z.iso.datetime({ message: "无效的更新时间" }).transform(value => new Date(value)),
])

export type UpdatedBeforeParams = z.infer<typeof updatedBeforeSchema>

export const updatedBeforeParser = getParser(updatedBeforeSchema)
