import { closeSync, mkdirSync, openSync } from "node:fs"
import { resolve } from "node:path"
import { cwd, env } from "node:process"

const databaseFileName = env.NODE_ENV === "development" ? "development.db" : "production.db"
const dataDirectoryPath = resolve(cwd(), "data")
const databaseFilePath = resolve(dataDirectoryPath, databaseFileName)

mkdirSync(dataDirectoryPath, { recursive: true })
closeSync(openSync(databaseFilePath, "a"))
