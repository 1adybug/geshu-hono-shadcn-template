import dayjs, { type ConfigType } from "dayjs"
import timezone from "dayjs/plugin/timezone.js"
import utc from "dayjs/plugin/utc.js"

export const DefaultDateTimeZone = "Asia/Shanghai"

export const DefaultDateTimeFormat = "YYYY-MM-DD HH:mm:ss"

dayjs.extend(utc)
dayjs.extend(timezone)

export function getDateTimeZone() {
    const publicTimeZone = import.meta.env?.PUBLIC_TIME_ZONE
    const serverTimeZone = typeof process === "undefined" ? undefined : process.env.PUBLIC_TIME_ZONE
    const timeZone = (publicTimeZone || serverTimeZone)?.trim()

    if (!timeZone) return DefaultDateTimeZone

    try {
        new Intl.DateTimeFormat("zh-CN", { timeZone }).format(0)
        return timeZone
    } catch {
        return DefaultDateTimeZone
    }
}

export function getDateTime(input?: ConfigType) {
    return dayjs(input).tz(getDateTimeZone())
}

export function formatDateTime(input: ConfigType, format: string = DefaultDateTimeFormat) {
    return getDateTime(input).format(format)
}
