import { prisma } from "@/prisma"

import type { AddUserParams } from "@/schemas/addUser"
import type { ImportUserParams } from "@/schemas/importUser"

import { auth } from "@/server/auth"
import { getRandomPassword } from "@/server/getRandomPassword"
import { getTempEmail } from "@/server/getTempEmail"
import { badRequest } from "@/server/httpError"
import { type UserImportWorkbookResultRow, type UserImportWorkbookRow, createUserImportResultWorkbook, parseUserImportWorkbook } from "@/server/userWorkbook"

const XlsxFilenamePattern = /\.xlsx$/i

export interface ImportUserResult {
    total: number
    successCount: number
    duplicateCount: number
    errorCount: number
    resultWorkbookBase64: string
    resultFilename: string
}

interface ImportUserRowContext {
    duplicateNames: Set<string>
    duplicatePhoneNumbers: Set<string>
    existingNames: Set<string>
    existingPhoneNumbers: Set<string>
}

function assertXlsxFile(file: File) {
    if (!XlsxFilenamePattern.test(file.name)) throw badRequest("请上传 xlsx 文件")
}

function getDuplicateValues<T>(values: T[]) {
    const valueCount = new Map<string, number>()

    values.forEach(value => {
        const key = String(value)
        valueCount.set(key, (valueCount.get(key) ?? 0) + 1)
    })

    return new Set(
        Array.from(valueCount.entries())
            .filter(([, count]) => count > 1)
            .map(([value]) => value),
    )
}

function getValidImportParams(rows: UserImportWorkbookRow[]) {
    return rows.map(row => row.params).filter(Boolean as unknown as (params: AddUserParams | undefined) => params is AddUserParams)
}

async function getImportUserRowContext(users: AddUserParams[]): Promise<ImportUserRowContext> {
    const names = users.map(user => user.name)
    const phoneNumbers = users.map(user => user.phoneNumber)

    const emptyContext = {
        duplicateNames: getDuplicateValues(names),
        duplicatePhoneNumbers: getDuplicateValues(phoneNumbers),
        existingNames: new Set<string>(),
        existingPhoneNumbers: new Set<string>(),
    }

    if (users.length === 0) return emptyContext

    const existingUsers = await prisma.user.findMany({
        where: {
            OR: [
                {
                    name: {
                        in: names,
                    },
                },
                {
                    phoneNumber: {
                        in: phoneNumbers,
                    },
                },
            ],
        },
        select: {
            name: true,
            phoneNumber: true,
        },
    })

    return {
        duplicateNames: getDuplicateValues(names),
        duplicatePhoneNumbers: getDuplicateValues(phoneNumbers),
        existingNames: new Set(existingUsers.filter(user => names.includes(user.name)).map(user => user.name)),
        existingPhoneNumbers: new Set(existingUsers.filter(user => phoneNumbers.includes(user.phoneNumber)).map(user => user.phoneNumber)),
    }
}

async function createImportedUser({ name, nickname, phoneNumber, role }: AddUserParams) {
    const { user } = await auth.api.createUser({
        body: {
            name,
            email: getTempEmail(phoneNumber),
            password: getRandomPassword(),
            role,
            data: {
                nickname,
                phoneNumber,
            },
        },
    })

    return prisma.user.findUniqueOrThrow({ where: { id: user.id } })
}

async function importUserRow(row: UserImportWorkbookRow, context: ImportUserRowContext): Promise<UserImportWorkbookResultRow> {
    const { data, params } = row

    if (!params) {
        return {
            data,
            status: `错误：${row.errorMessage || "用户数据无效"}`,
        }
    }

    if (context.duplicateNames.has(params.name)) {
        return {
            data,
            status: "错误：用户名在导入文件中重复",
        }
    }

    if (context.duplicatePhoneNumbers.has(params.phoneNumber)) {
        return {
            data,
            status: "错误：手机号在导入文件中重复",
        }
    }

    if (context.existingNames.has(params.name)) {
        return {
            data,
            status: "重复：用户名已存在",
        }
    }

    if (context.existingPhoneNumbers.has(params.phoneNumber)) {
        return {
            data,
            status: "错误：手机号已被注册",
        }
    }

    try {
        await createImportedUser(params)

        return {
            data,
            status: "成功",
        }
    } catch (error) {
        return {
            data,
            status: `错误：${error instanceof Error ? error.message : "导入用户失败"}`,
        }
    }
}

function getImportUserResultWorkbookBase64(rows: UserImportWorkbookResultRow[]) {
    return Buffer.from(createUserImportResultWorkbook(rows)).toString("base64")
}

function getImportUserResult(rows: UserImportWorkbookResultRow[]): ImportUserResult {
    const successCount = rows.filter(row => row.status === "成功").length
    const duplicateCount = rows.filter(row => row.status.startsWith("重复")).length
    const errorCount = rows.filter(row => row.status.startsWith("错误")).length

    return {
        total: rows.length,
        successCount,
        duplicateCount,
        errorCount,
        resultWorkbookBase64: getImportUserResultWorkbookBase64(rows),
        resultFilename: "用户导入结果.xlsx",
    }
}

export async function importUser({ file }: ImportUserParams): Promise<ImportUserResult> {
    assertXlsxFile(file)

    const rows = parseUserImportWorkbook(new Uint8Array(await file.arrayBuffer()))
    if (rows.length === 0) throw badRequest("导入文件没有用户数据")

    const context = await getImportUserRowContext(getValidImportParams(rows))

    const resultRows: UserImportWorkbookResultRow[] = []

    for (const row of rows) resultRows.push(await importUserRow(row, context))

    return getImportUserResult(resultRows)
}
