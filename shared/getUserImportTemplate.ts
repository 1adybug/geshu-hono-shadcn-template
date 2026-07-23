import { createUserImportTemplateWorkbook } from "@/server/userWorkbook"

export async function getUserImportTemplate() {
    return createUserImportTemplateWorkbook()
}
