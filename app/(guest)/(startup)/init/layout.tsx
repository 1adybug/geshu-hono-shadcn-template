import { type FC, Fragment } from "react"

import { Navigate, Outlet } from "react-router"

import { useInitializationStatus } from "@/hooks/useInitializationStatus"

const Layout: FC = () => {
    const { data, isLoading } = useInitializationStatus()

    if (isLoading) return null
    if (data?.initialized) return <Navigate to="/" replace />

    return (
        <Fragment>
            <title>初始化 · 格数科技</title>
            <Outlet />
        </Fragment>
    )
}

export default Layout
