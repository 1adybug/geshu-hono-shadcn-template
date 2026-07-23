import { getParser } from "."
import type { z } from "zod/v4"

import { queryUserSchema } from "./queryUser"

export const exportUserSchema = queryUserSchema

export type ExportUserParams = z.infer<typeof exportUserSchema>

export const exportUserParser = getParser(exportUserSchema)
