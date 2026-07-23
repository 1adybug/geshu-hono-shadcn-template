import { type FC, Fragment } from "react"

import { Outlet } from "react-router"

const Layout: FC = () => (
    <Fragment>
        <title>错误日志 · 格数科技</title>
        <Outlet />
    </Fragment>
)

export default Layout
