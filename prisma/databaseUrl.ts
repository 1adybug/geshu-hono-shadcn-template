import { resolve } from "node:path"

const databaseFileName = process.env.NODE_ENV === "development" ? "development.db" : "production.db"
const databasePath = resolve(process.cwd(), "data", databaseFileName).replaceAll("\\", "/")

export const DatabaseUrl = `file:${databasePath}`
