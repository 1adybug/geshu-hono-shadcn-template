import { readdir, readFile } from "node:fs/promises"
import { relative, resolve, sep } from "node:path"
import process from "node:process"

import ts from "typescript"

const projectRoot = process.cwd()

const clientDirectories = ["apis", "app", "components", "constants", "hooks", "presets", "schemas", "types", "utils"]

const clientEntryFiles = ["App.tsx", "index.tsx"]

const forbiddenRuntimeRoots = ["prisma", "routes", "server", "shared"]

const allowedEnvironmentNames = new Set(["ASSET_PREFIX", "BASE_URL", "DEV", "MODE", "NODE_ENV", "PROD", "SSR"])
const sourceFilePattern = /\.[cm]?[jt]sx?$/

function toProjectPath(filePath) {
    return relative(projectRoot, filePath).split(sep).join("/")
}

async function collectSourceFiles(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true })
    const files = await Promise.all(
        entries.map(entry => {
            const entryPath = resolve(directoryPath, entry.name)
            if (entry.isDirectory()) return collectSourceFiles(entryPath)
            if (entry.isFile() && sourceFilePattern.test(entry.name) && !entry.name.endsWith(".d.ts")) return [entryPath]
            return []
        }),
    )

    return files.flat()
}

function getModuleProjectPath(sourceFilePath, moduleName) {
    if (moduleName.startsWith("@/")) return moduleName.slice(2)
    if (!moduleName.startsWith(".")) return undefined

    return toProjectPath(resolve(sourceFilePath, "..", moduleName))
}

function getForbiddenRuntimeRoot(sourceFilePath, moduleName) {
    const moduleProjectPath = getModuleProjectPath(sourceFilePath, moduleName)
    if (!moduleProjectPath) return undefined

    return forbiddenRuntimeRoots.find(root => moduleProjectPath === root || moduleProjectPath.startsWith(`${root}/`))
}

function isRuntimeImport(node) {
    const clause = node.importClause
    if (!clause) return true
    if (clause.isTypeOnly) return false
    if (clause.name) return true
    if (!clause.namedBindings) return false
    if (ts.isNamespaceImport(clause.namedBindings)) return true

    return clause.namedBindings.elements.some(element => !element.isTypeOnly)
}

function isRuntimeExport(node) {
    if (node.isTypeOnly) return false
    if (!node.exportClause || !ts.isNamedExports(node.exportClause)) return true
    return node.exportClause.elements.some(element => !element.isTypeOnly)
}

function isImportMeta(node) {
    return ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword && node.name.text === "meta"
}

function getEnvironmentObjectKind(node) {
    if (!ts.isPropertyAccessExpression(node) || node.name.text !== "env") return undefined
    if (ts.isIdentifier(node.expression) && node.expression.text === "process") return "process.env"
    if (isImportMeta(node.expression)) return "import.meta.env"
    return undefined
}

function getEnvironmentAccess(node) {
    const kind = getEnvironmentObjectKind(node)
    if (!kind) return undefined

    const parent = node.parent

    if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
        return {
            kind,
            name: parent.name.text,
            node: parent,
        }
    }

    if (ts.isElementAccessExpression(parent) && parent.expression === node) {
        const argument = parent.argumentExpression
        return {
            kind,
            name: argument && ts.isStringLiteralLike(argument) ? argument.text : undefined,
            node: parent,
        }
    }

    return {
        kind,
        name: undefined,
        node,
    }
}

function isAllowedEnvironmentName(name) {
    return !!name && (name.startsWith("PUBLIC_") || allowedEnvironmentNames.has(name))
}

function getLineNumber(sourceFile, node) {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function inspectSourceFile(filePath, sourceText) {
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true)

    const issues = []

    function addIssue(node, message) {
        issues.push({
            filePath: toProjectPath(filePath),
            line: getLineNumber(sourceFile, node),
            message,
        })
    }

    function inspectModuleReference(node, moduleName, runtime) {
        const forbiddenRoot = runtime ? getForbiddenRuntimeRoot(filePath, moduleName) : undefined
        if (forbiddenRoot) addIssue(node, `客户端代码禁止运行时导入 ${forbiddenRoot} 层: ${moduleName}`)
    }

    function visit(node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier))
            inspectModuleReference(node, node.moduleSpecifier.text, isRuntimeImport(node))
        else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier))
            inspectModuleReference(node, node.moduleSpecifier.text, isRuntimeExport(node))
        else if (
            ts.isImportEqualsDeclaration(node) &&
            ts.isExternalModuleReference(node.moduleReference) &&
            node.moduleReference.expression &&
            ts.isStringLiteralLike(node.moduleReference.expression)
        )
            inspectModuleReference(node, node.moduleReference.expression.text, !node.isTypeOnly)
        else if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) {
            const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword
            const isRequire = ts.isIdentifier(node.expression) && node.expression.text === "require"
            if (isDynamicImport || isRequire) inspectModuleReference(node, node.arguments[0].text, true)
        }

        const environmentAccess = getEnvironmentAccess(node)

        if (environmentAccess && !isAllowedEnvironmentName(environmentAccess.name)) {
            const name = environmentAccess.name ?? "动态属性"
            addIssue(environmentAccess.node, `客户端代码只能读取 PUBLIC_ 环境变量或构建器公开变量，检测到 ${environmentAccess.kind}.${name}`)
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return issues
}

function verifyBoundaryRules() {
    const cases = [
        {
            name: "允许服务端类型导入",
            source: 'import type { AppType } from "@/server/app"',
            expectedIssueCount: 0,
        },
        {
            name: "允许混合语法中的类型导入",
            source: 'import { type QueryUser } from "@/shared/queryUser"',
            expectedIssueCount: 0,
        },
        {
            name: "阻止服务端运行时导入",
            source: 'import { auth } from "@/server/auth"',
            expectedIssueCount: 1,
        },
        {
            name: "阻止相对路径运行时导入",
            source: 'export { auth } from "../../server/auth"',
            expectedIssueCount: 1,
        },
        {
            name: "允许公开环境变量",
            source: "const value = import.meta.env.PUBLIC_TIME_ZONE",
            expectedIssueCount: 0,
        },
        {
            name: "阻止私有环境变量",
            source: "const value = import.meta.env.BETTER_AUTH_SECRET",
            expectedIssueCount: 1,
        },
        {
            name: "阻止动态环境变量读取",
            source: "const value = process.env[name]",
            expectedIssueCount: 1,
        },
    ]

    const failures = cases.flatMap(testCase => {
        const filePath = resolve(projectRoot, "app", "admin", "__clientBoundaryCheck.ts")
        const actualIssueCount = inspectSourceFile(filePath, testCase.source).length
        return actualIssueCount === testCase.expectedIssueCount
            ? []
            : [`${testCase.name}: 预期 ${testCase.expectedIssueCount} 个问题，实际 ${actualIssueCount} 个问题`]
    })

    if (failures.length) throw new Error(`客户端边界检查器自检失败：\n${failures.join("\n")}`)
}

verifyBoundaryRules()

const directoryFiles = await Promise.all(clientDirectories.map(directory => collectSourceFiles(resolve(projectRoot, directory))))

const sourceFiles = [...directoryFiles.flat(), ...clientEntryFiles.map(file => resolve(projectRoot, file))]

const results = await Promise.all(sourceFiles.map(async filePath => inspectSourceFile(filePath, await readFile(filePath, "utf8"))))
const issues = results.flat().sort((left, right) => left.filePath.localeCompare(right.filePath) || left.line - right.line)

if (issues.length) {
    issues.forEach(issue => console.error(`${issue.filePath}:${issue.line} ${issue.message}`))
    process.exitCode = 1
} else console.log(`客户端边界检查通过，共检查 ${sourceFiles.length} 个文件。`)
