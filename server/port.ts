const MinimumPort = 1
const MaximumPort = 65_535

export interface GetPortFromEnvironmentParams {
    name: "CLIENT_PORT" | "PORT" | "SERVER_PORT"
    defaultPort: number
    environment?: NodeJS.ProcessEnv
}

export function getPortFromEnvironment({ name, defaultPort, environment = process.env }: GetPortFromEnvironmentParams) {
    const rawValue = environment[name]
    const value = rawValue?.trim()

    if (!value) return defaultPort

    if (!/^\d+$/.test(value)) throw new Error(`${name} 必须是 ${MinimumPort} 到 ${MaximumPort} 之间的整数，当前值为 ${JSON.stringify(rawValue)}`)

    const port = Number(value)

    if (!Number.isSafeInteger(port) || port < MinimumPort || port > MaximumPort)
        throw new Error(`${name} 必须是 ${MinimumPort} 到 ${MaximumPort} 之间的整数，当前值为 ${JSON.stringify(rawValue)}`)

    return port
}

export function getDevelopmentServerPort(environment: NodeJS.ProcessEnv = process.env) {
    return getPortFromEnvironment({
        name: "SERVER_PORT",
        defaultPort: 3000,
        environment,
    })
}

export function getDevelopmentClientPort(environment: NodeJS.ProcessEnv = process.env) {
    return getPortFromEnvironment({
        name: "CLIENT_PORT",
        defaultPort: 5173,
        environment,
    })
}

export function getRuntimeServerPort(environment: NodeJS.ProcessEnv = process.env) {
    if (environment.NODE_ENV === "development") return getDevelopmentServerPort(environment)

    return getPortFromEnvironment({
        name: "PORT",
        defaultPort: 3000,
        environment,
    })
}

export function getDevelopmentServerUrl(environment: NodeJS.ProcessEnv = process.env) {
    return `http://localhost:${getDevelopmentServerPort(environment)}`
}

export function getDevelopmentClientUrl(environment: NodeJS.ProcessEnv = process.env) {
    return `http://localhost:${getDevelopmentClientPort(environment)}`
}
