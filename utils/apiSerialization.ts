const ApiSerializationKey = "$geshu"

interface SerializedBigInt {
    [ApiSerializationKey]: "bigint"
    value: string
}

interface SerializedDate {
    [ApiSerializationKey]: "date"
    value: string
}

export type SerializedApiData<T> = T extends bigint
    ? SerializedBigInt
    : T extends Date
      ? SerializedDate
      : T extends readonly unknown[]
        ? { [TKey in keyof T]: SerializedApiData<T[TKey]> }
        : T extends object
          ? { [TKey in keyof T]: SerializedApiData<T[TKey]> }
          : T

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function serializeValue(value: unknown, ancestors: WeakSet<object>): unknown {
    if (typeof value === "bigint") {
        return {
            [ApiSerializationKey]: "bigint",
            value: value.toString(),
        } satisfies SerializedBigInt
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) throw new TypeError("API 响应不能包含无效日期")

        return {
            [ApiSerializationKey]: "date",
            value: value.toISOString(),
        } satisfies SerializedDate
    }

    if (typeof value === "number" && !Number.isFinite(value)) throw new TypeError("API 响应不能包含非有限数字")
    if (value === undefined || typeof value === "function" || typeof value === "symbol") throw new TypeError(`API 响应不能包含 ${typeof value}`)

    if (!isObject(value)) return value
    if (ancestors.has(value)) throw new TypeError("API 响应不能包含循环引用")

    ancestors.add(value)

    try {
        if (Array.isArray(value)) return value.map(item => serializeValue(item, ancestors))

        const prototype = Object.getPrototypeOf(value) as unknown
        if (prototype !== null && prototype !== Object.prototype) throw new TypeError(`API 响应不能包含 ${value.constructor?.name || "未知"} 实例`)
        if (ApiSerializationKey in value) throw new TypeError(`API 响应对象不能占用 ${ApiSerializationKey} 字段`)

        return Object.fromEntries(
            Object.entries(value)
                .filter(([, entryValue]) => entryValue !== undefined)
                .map(([key, entryValue]) => [key, serializeValue(entryValue, ancestors)]),
        )
    } finally {
        ancestors.delete(value)
    }
}

function deserializeTaggedValue(value: Record<string, unknown>) {
    const type = value[ApiSerializationKey]
    if (type !== "bigint" && type !== "date") return undefined

    if (Object.keys(value).length !== 2 || typeof value.value !== "string") throw new TypeError("API 响应中的序列化值结构无效")

    if (type === "bigint") {
        if (!/^-?(?:0|[1-9]\d*)$/.test(value.value)) throw new TypeError("API 响应中的 BigInt 无效")
        return BigInt(value.value)
    }

    const date = new Date(value.value)
    if (Number.isNaN(date.getTime()) || date.toISOString() !== value.value) throw new TypeError("API 响应中的 Date 无效")
    return date
}

function deserializeValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(deserializeValue)
    if (!isObject(value)) return value

    if (ApiSerializationKey in value) {
        const taggedValue = deserializeTaggedValue(value)
        if (taggedValue === undefined) throw new TypeError("API 响应中的序列化类型无效")
        return taggedValue
    }

    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, deserializeValue(entryValue)]))
}

export function serializeApiData<T>(data: T) {
    return serializeValue(data, new WeakSet()) as SerializedApiData<T>
}

export function deserializeApiData<T>(data: SerializedApiData<T>) {
    return deserializeValue(data) as T
}
