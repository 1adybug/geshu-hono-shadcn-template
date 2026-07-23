import { type Dispatch, type SetStateAction, useCallback, useMemo } from "react"

import { useLocation, useNavigate } from "react-router"
import { type QueryState, type QueryStateOptions, type QueryToStateFnMap, type SetQueryState, useNativeQueryState } from "soda-hooks"

export interface UseQueryStateOptions {
    replace?: boolean
    scroll?: boolean
}

export function useQueryState<T extends string = never, K extends QueryToStateFnMap = QueryToStateFnMap, P extends boolean = true>(
    options?: QueryStateOptions<T, K, P> & UseQueryStateOptions,
): [QueryState<T, K, P>, SetQueryState<T, K, P>] {
    const location = useLocation()
    const navigate = useNavigate()
    const { replace, scroll = false, ...rest } = options ?? {}
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])

    const setSearchParams: Dispatch<SetStateAction<URLSearchParams>> = useCallback(
        value => {
            const nextSearchParams = typeof value === "function" ? value(new URLSearchParams(location.search)) : value
            const search = nextSearchParams.toString()

            void navigate(
                {
                    pathname: location.pathname,
                    search: search ? `?${search}` : "",
                },
                {
                    replace,
                    preventScrollReset: !scroll,
                },
            )
        },
        [location.pathname, location.search, navigate, replace, scroll],
    )

    return useNativeQueryState({ ...rest, search: searchParams, setSearch: setSearchParams })
}
