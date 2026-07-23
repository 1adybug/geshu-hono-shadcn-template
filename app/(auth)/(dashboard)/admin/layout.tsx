import type { FC } from "react"

import { Navigate, Outlet } from "react-router"

import { useUser } from "@/components/UserProvider"

import { UserRole } from "@/schemas/userRole"

const Layout: FC = () => {
    const user = useUser()
    if (user?.role !== UserRole.管理员) return <Navigate to="/" replace />
    return <Outlet />
}

export default Layout
