import type { FC } from "react"

import { Navigate, Outlet, useLocation } from "react-router"

import { useCurrentUser } from "@/hooks/useCurrentUser"

import { UserProvider } from "./UserProvider"

export interface AuthProps {
    mode: "auth" | "guest" | "public"
}

function getLoginRedirect(pathname: string, search: string) {
    const from = `${pathname}${search}`
    return `/login?from=${encodeURIComponent(from)}`
}

function getGuestRedirect(search: string) {
    const from = new URLSearchParams(search).get("from")?.trim()
    if (!from?.startsWith("/") || from.startsWith("//")) return "/"
    return from
}

export const Auth: FC<AuthProps> = ({ mode }) => {
    const location = useLocation()
    const { data, isLoading } = useCurrentUser()
    const user = data?.user

    if (isLoading) return null
    if (mode === "guest" && user) return <Navigate to={getGuestRedirect(location.search)} replace />
    if (mode === "auth" && !user) return <Navigate to={getLoginRedirect(location.pathname, location.search)} replace />

    return (
        <UserProvider value={user}>
            <Outlet />
        </UserProvider>
    )
}
