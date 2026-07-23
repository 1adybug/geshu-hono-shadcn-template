import { type $ZodType, type output, flattenError, safeParse } from "zod/v4/core"

export function getParser<T extends $ZodType>(schema: T) {
    return function parser(arg: unknown): output<T> {
        const { data, error } = safeParse(schema, arg)

        if (error) {
            const { formErrors, fieldErrors } = flattenError(error)
            throw new Error(
                formErrors
                    .concat(
                        Object.values(fieldErrors)
                            .filter(Boolean as unknown as (value: unknown) => value is string[])
                            .flat(),
                    )
                    .join(", "),
                { cause: error },
            )
        }

        return data
    }
}
